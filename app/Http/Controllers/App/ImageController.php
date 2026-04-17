<?php

namespace App\Http\Controllers\App;

use App\Http\Controllers\Controller;
use App\Models\App\Image;
use App\Models\App\Order;
use App\Models\App\OrderLog;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\File;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class ImageController extends Controller
{
    private function currentTenantId(): ?int
    {
        return $this->currentUser()?->tenant_id ? (int) $this->currentUser()->tenant_id : null;
    }

    private function logOrderAction(Order $order, string $action, array $data = []): void
    {
        OrderLog::create([
            'order_id' => $order->id,
            'user_id' => $this->currentUser()?->id,
            'action' => $action,
            'data' => $data === [] ? null : $data,
            'created_at' => now(),
        ]);
    }

    private function currentUser(): ?User
    {
        $user = Auth::user() ?? Auth::guard('sanctum')->user();

        return $user instanceof User ? $user : null;
    }

    public function index(Request $request)
    {
        $query = $request->get('or');
        $order = Order::findOrFail($query);
        $this->authorize('view', $order);

        $images = Image::where('order_id', $query)->get();

        return Inertia::render('app/images/index', ['savedimages' => $images, 'orderid' => $order->id]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate(
            [
                'order_id' => ['required', 'exists:orders,id'],
                'images' => ['required', 'array', 'min:1'],
                'images.*' => [
                    'bail',
                    'file',
                    'image',
                    'mimes:jpeg,png,jpg,gif,svg',
                    'max:10240',
                ],
            ],
            [
                'images.*.image' => 'Apenas imagens são permitidas.',
                'images.*.mimes' => 'Formato inválido. Envie apenas JPG, PNG, GIF ou SVG.',
            ]
        );

        $order = Order::findOrFail($validated['order_id']);
        $this->authorize('update', $order);

        /** 🔒 REGRA DE NEGÓCIO (TOTAL POR ORDEM) */
        $existingCount = Image::where('order_id', $validated['order_id'])->count();
        $incomingCount = count($validated['images']);

        if (($existingCount + $incomingCount) > 4) {
            throw ValidationException::withMessages([
                'images' => 'Esta ordem pode ter no máximo 4 imagens no total.',
            ]);
        }

        $storePath = public_path('storage/orders/'.$validated['order_id']);

        if (! file_exists($storePath)) {
            mkdir($storePath, 0777, true);
        }

        foreach ($validated['images'] as $imageFile) {
            $filename = uniqid().'.'.$imageFile->getClientOriginalExtension();
            $imageFile->move($storePath, $filename);

            Image::create([
                'order_id' => $validated['order_id'],
                'filename' => $filename,
            ]);
        }

        $this->logOrderAction($order, 'image_uploaded', [
            'count' => $incomingCount,
            'total_images' => $existingCount + $incomingCount,
        ]);

        return redirect()->back()->with('success', 'Imagens enviadas com sucesso!');
    }

    public function destroy(Image $image)
    {
        $order = Order::query()->findOrFail($image->order_id);
        $this->authorize('update', $order);

        $storePath = public_path('storage/orders/'.$image->order_id);
        if (file_exists($storePath.DIRECTORY_SEPARATOR.$image->filename)) {
            unlink($storePath.DIRECTORY_SEPARATOR.$image->filename);
        }
        $filename = $image->filename;
        $image->delete();
        $this->logOrderAction($order, 'image_deleted', [
            'filename' => $filename,
        ]);

        return redirect()->back()->with('success', 'Imagem excluida com sucesso!');
    }

    // Delete image for id
    public function deleteImageOrder(Image $image, $aimage)
    {
        abort_unless((int) $image->id === (int) $aimage, 404);
        $order = Order::query()->findOrFail($image->order_id);
        $this->authorize('update', $order);

        $storePath = public_path('storage'.DIRECTORY_SEPARATOR.'orders'.DIRECTORY_SEPARATOR.$image->order_id);
        if (file_exists($storePath.DIRECTORY_SEPARATOR.$image->filename)) {
            unlink($storePath.DIRECTORY_SEPARATOR.$image->filename);
        }
        $filename = $image->filename;
        $image->delete();
        $this->logOrderAction($order, 'image_deleted', [
            'filename' => $filename,
        ]);

        return [
            'success' => true,
            'message' => 'Imagem deletada com sucesso!',
        ];
    }

    public function upload(Request $request)
    {
        $validated = $request->validate([
            'order_id' => ['required', 'integer'],
            'filename' => ['required', 'string'],
        ]);

        $order = Order::query()->findOrFail($validated['order_id']);
        $this->authorize('update', $order);

        $image = base64_decode($validated['filename']);
        $storePath = public_path('storage/orders/'.$validated['order_id']);
        if (! file_exists($storePath)) {
            mkdir($storePath, 0777, true);
        }
        $filename = time().rand(1, 50).'.'.'png';
        File::put('storage/orders/'.$validated['order_id'].'/'.$filename, $image);
        Image::create([
            'order_id' => $validated['order_id'],
            'filename' => $filename,
            'tenant_id' => $this->currentTenantId(),
        ]);

        $this->logOrderAction($order, 'image_uploaded', [
            'count' => 1,
            'total_images' => Image::where('order_id', $order->id)->count(),
        ]);

        return [
            'success' => true,
            'message' => 'Imagem salva com sucesso',
        ];
    }

    public function getImages(Request $request)
    {
        $validated = $request->validate([
            'order' => ['required', 'integer'],
        ]);

        $order = Order::query()->findOrFail($validated['order']);
        $this->authorize('view', $order);

        $images = Image::where('order_id', $validated['order'])->get();

        return [
            'success' => true,
            'result' => $images,
        ];
    }
}
