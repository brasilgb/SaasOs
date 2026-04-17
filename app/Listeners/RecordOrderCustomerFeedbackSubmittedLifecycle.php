<?php

namespace App\Listeners;

use App\Events\OrderCustomerFeedbackSubmitted;
use App\Models\App\Order;
use App\Models\App\OrderLog;
use App\Services\OperationalAuditService;

class RecordOrderCustomerFeedbackSubmittedLifecycle
{
    public function __construct(private readonly OperationalAuditService $operationalAuditService) {}

    public function handle(OrderCustomerFeedbackSubmitted $event): void
    {
        $order = Order::query()->find($event->orderId);

        if (! $order) {
            return;
        }

        OrderLog::create([
            'order_id' => $order->id,
            'user_id' => null,
            'action' => 'customer_feedback_submitted',
            'data' => $event->data,
            'created_at' => now(),
        ]);

        $this->operationalAuditService->record(
            'order_customer_feedback_submitted',
            'order',
            $order,
            null,
            $event->data,
        );
    }
}
