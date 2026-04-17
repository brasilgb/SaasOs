<?php

namespace App\Listeners;

use App\Events\OrderCustomerPickupAcknowledged;
use App\Models\App\Order;
use App\Models\App\OrderLog;
use App\Services\OperationalAuditService;

class RecordOrderCustomerPickupAcknowledgedLifecycle
{
    public function __construct(private readonly OperationalAuditService $operationalAuditService) {}

    public function handle(OrderCustomerPickupAcknowledged $event): void
    {
        $order = Order::query()->find($event->orderId);

        if (! $order) {
            return;
        }

        OrderLog::create([
            'order_id' => $order->id,
            'user_id' => null,
            'action' => 'customer_pickup_acknowledged',
            'data' => $event->data,
            'created_at' => now(),
        ]);

        $this->operationalAuditService->record(
            'order_customer_pickup_acknowledged',
            'order',
            $order,
            null,
            $event->data,
        );
    }
}
