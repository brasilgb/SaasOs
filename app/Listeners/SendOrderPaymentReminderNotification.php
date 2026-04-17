<?php

namespace App\Listeners;

use App\Events\OrderPaymentReminderRequested;
use App\Services\OrderNotificationService;

class SendOrderPaymentReminderNotification
{
    public function __construct(private readonly OrderNotificationService $orderNotificationService) {}

    public function handle(OrderPaymentReminderRequested $event): void
    {
        $this->orderNotificationService->sendPaymentReminder(
            $event->order,
            $event->paymentSummary,
            $event->isOverdue,
        );
    }
}
