<?php

namespace App\Listeners;

use App\Events\OrderPaymentRegistered;
use App\Models\App\Order;
use App\Models\App\OrderLog;
use App\Services\OperationalAuditService;

class RecordOrderPaymentRegisteredLifecycle
{
    public function __construct(private readonly OperationalAuditService $operationalAuditService) {}

    public function handle(OrderPaymentRegistered $event): void
    {
        $order = Order::query()->find($event->orderId);

        if (! $order) {
            return;
        }

        OrderLog::create([
            'order_id' => $order->id,
            'user_id' => $event->actorId,
            'action' => 'payment_registered',
            'data' => $event->data,
            'created_at' => now(),
        ]);

        $this->operationalAuditService->record(
            'order_payment_registered',
            'order',
            $order,
            $event->actorId,
            $event->data,
        );
    }
}
