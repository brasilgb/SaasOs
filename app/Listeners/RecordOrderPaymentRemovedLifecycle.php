<?php

namespace App\Listeners;

use App\Events\OrderPaymentRemoved;
use App\Models\App\Order;
use App\Models\App\OrderLog;
use App\Services\OperationalAuditService;

class RecordOrderPaymentRemovedLifecycle
{
    public function __construct(private readonly OperationalAuditService $operationalAuditService) {}

    public function handle(OrderPaymentRemoved $event): void
    {
        $order = Order::query()->find($event->orderId);

        if (! $order) {
            return;
        }

        OrderLog::create([
            'order_id' => $order->id,
            'user_id' => $event->actorId,
            'action' => 'payment_removed',
            'data' => $event->data,
            'created_at' => now(),
        ]);

        $this->operationalAuditService->record(
            'order_payment_removed',
            'order',
            $order,
            $event->actorId,
            $event->data,
        );
    }
}
