<?php

namespace App\Http\Controllers\App;

use App\Http\Controllers\Controller;
use App\Models\App\Image; // Assuming you have an Image model
use App\Models\App\Order;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\File;
use Illuminate\Validation\ValidationException;

class ImageController extends Controller
{
    public function index(Request $request)
    {
        $query = $request->get('or');
        $orderid = Order::where('id', $query)->first()->id;

        $images = Image::where("order_id", $query)->get();

        return Inertia::render('app/images/index', ['savedimages' => $images, 'orderid' => $orderid]);
    }

public function store(Request $request): RedirectResponse
{
    $validated = $request->validate(
        [
            'order_id' => ['required', 'exists:orders,id'],
            'images'   => ['required', 'array', 'min:1'],
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

    /** 🔒 REGRA DE NEGÓCIO (TOTAL POR ORDEM) */
    $existingCount = Image::where('order_id', $validated['order_id'])->count();
    $incomingCount = count($validated['images']);

    if (($existingCount + $incomingCount) > 4) {
        throw ValidationException::withMessages([
            'images' => 'Esta ordem pode ter no máximo 4 imagens no total.',
        ]);
    }

    $storePath = public_path('storage/orders/' . $validated['order_id']);

    if (!file_exists($storePath)) {
        mkdir($storePath, 0777, true);
    }

    foreach ($validated['images'] as $imageFile) {
        $filename = uniqid() . '.' . $imageFile->getClientOriginalExtension();
        $imageFile->move($storePath, $filename);

        Image::create([
            'order_id' => $validated['order_id'],
            'filename' => $filename,
        ]);
    }

    return redirect()->back()->with('success', 'Imagens enviadas com sucesso!');
}

    public function destroy(Image $image)
    {
        $storePath = public_path('storage/orders/' . $image->order_id);
        if (file_exists($storePath . DIRECTORY_SEPARATOR . $image->filename)) {
            unlink($storePath . DIRECTORY_SEPARATOR . $image->filename);
        }
        $image->delete();
        return redirect()->back()->with('success', 'Imagem excluida com sucesso!');
    }

    // Delete image for id
    public function deleteImageOrder(Image $image, $aimage)
    {
        $imgorder = Image::where('id', $aimage)->first();

        $storePath = public_path('storage' . DIRECTORY_SEPARATOR . 'orders' . DIRECTORY_SEPARATOR . $imgorder->order_id);
        if (file_exists($storePath . DIRECTORY_SEPARATOR . $imgorder->filename)) {
            unlink($storePath . DIRECTORY_SEPARATOR . $imgorder->filename);
        }
        $image->where('id', $imgorder->id)->delete();
        return [
            'success' => true,
            'message' => 'Imagem deletada com sucesso!'
        ];
    }

    public function upload(Request $request)
    {
        $image = base64_decode($request->filename);
        //  dd($image);   
        // $image = $request->file('imagem');
        // dd($request->all());
        $storePath = public_path('storage/orders/' . $request->order_id);
        if (!file_exists($storePath)) {
            mkdir($storePath, 0777, true);
        };
        $filename = time() . rand(1, 50) . '.' . 'png';
        File::put('storage/orders/' . $request->order_id . '/' . $filename,  $image);
        Image::create([
            'order_id' => $request->order_id,
            'filename' => $filename,
            'tenant_id' => $request->tenant_id
        ]);
        return [
            "success" => true,
            "message" => "Imagem salva com sucesso"
        ];
    }

    public function getImages(Request $request)
    {
        $images = Image::where("order_id", $request->order)->get();
        return [
            "success" => true,
            "result" => $images
        ];
    }
}
