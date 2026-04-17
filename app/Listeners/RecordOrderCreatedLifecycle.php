<?php

namespace App\Listeners;

use App\Events\OrderLifecycleCreated;
use App\Models\App\Order;
use App\Models\App\OrderLog;
use App\Services\OperationalAuditService;

class RecordOrderCreatedLifecycle
{
    public function __construct(private readonly OperationalAuditService $operationalAuditService) {}

    public function handle(OrderLifecycleCreated $event): void
    {
        $order = Order::query()->find($event->orderId);

        if (! $order) {
            return;
        }

        OrderLog::create([
            'order_id' => $order->id,
            'user_id' => $event->actorId,
            'action' => 'created',
            'data' => $event->data,
            'created_at' => now(),
        ]);

        $this->operationalAuditService->record(
            'order_created',
            'order',
            $order,
            $event->actorId,
            $event->data,
        );
    }
}
