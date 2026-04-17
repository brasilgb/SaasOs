<?php

namespace App\Listeners;

use App\Events\OrderLifecycleStatusChanged;
use App\Models\App\Order;
use App\Models\App\OrderLog;
use App\Services\OperationalAuditService;

class RecordOrderStatusChangedLifecycle
{
    public function __construct(private readonly OperationalAuditService $operationalAuditService) {}

    public function handle(OrderLifecycleStatusChanged $event): void
    {
        $order = Order::query()->find($event->orderId);

        if (! $order) {
            return;
        }

        OrderLog::create([
            'order_id' => $order->id,
            'user_id' => $event->actorId,
            'action' => 'status_changed',
            'data' => $event->logData,
            'created_at' => now(),
        ]);

        $this->operationalAuditService->record(
            'order_status_changed',
            'order',
            $order,
            $event->actorId,
            $event->auditData,
        );
    }
}
