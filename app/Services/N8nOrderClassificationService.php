<?php

namespace App\Services;

use App\Models\App\Order;
use Illuminate\Support\Facades\Log;
use Spatie\WebhookServer\WebhookCall;

class N8nOrderClassificationService
{
    public function notifyOrderCreated(Order $order): void
    {
        $url = config('services.n8n.webhook_ordem_criada');

        if (! $url) {
            return;
        }

        $order->loadMissing('customer');

        WebhookCall::create()
            ->url($url)
            ->useSecret(config('services.n8n.webhook_secret'))
            ->payload($this->buildPayload($order))
            ->dispatch();
    }

    /**
     * @return array<string, mixed>
     */
    private function buildPayload(Order $order): array
    {
        return [
            'order_id' => $order->id,
            'tenant_id' => $order->tenant_id,
            'order_number' => $order->order_number,
            'order_type' => $order->order_type,
            'defect' => $order->defect,
            'service_details' => $order->service_details,
            'service_status' => $order->service_status,
            'customer' => $order->customer ? [
                'id' => $order->customer->id,
                'name' => $order->customer->name,
            ] : null,
            'created_at' => $order->created_at?->toIso8601String(),
        ];
    }
}
