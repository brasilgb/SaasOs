<?php

namespace App\Http\Controllers\App;

use App\Exceptions\WhatsAppException;
use App\Http\Controllers\Controller;
use App\Services\WhatsAppService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;

class WhatsappConnectionController extends Controller
{
    public function __construct(private readonly WhatsAppService $whatsAppService) {}

    private function tenantId(): int
    {
        return (int) Auth::user()->tenant_id;
    }

    public function status()
    {
        Gate::authorize('whatsapp-messages.access');

        $connection = $this->whatsAppService->status($this->tenantId());

        return response()->json([
            'status' => $connection->status,
            'phone_number' => $connection->phone_number,
            'connected_at' => $connection->connected_at?->toIso8601String(),
        ]);
    }

    public function connect(): RedirectResponse
    {
        Gate::authorize('whatsapp-messages.access');

        try {
            $this->whatsAppService->connect($this->tenantId());
        } catch (WhatsAppException $exception) {
            return back()->with('error', $exception->getMessage());
        }

        return back()->with('success', 'Conectando ao WhatsApp. Escaneie o QR Code para concluir.');
    }

    public function qrCode(): Response
    {
        Gate::authorize('whatsapp-messages.access');

        try {
            $image = $this->whatsAppService->qrCode($this->tenantId());
        } catch (WhatsAppException $exception) {
            abort(503, $exception->getMessage());
        }

        return response($image, 200)->header('Content-Type', 'image/png');
    }

    public function disconnect(): RedirectResponse
    {
        Gate::authorize('whatsapp-messages.access');

        $this->whatsAppService->disconnect($this->tenantId());

        return back()->with('success', 'WhatsApp desconectado.');
    }
}
