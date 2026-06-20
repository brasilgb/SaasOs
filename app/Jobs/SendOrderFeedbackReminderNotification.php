<?php

namespace App\Jobs;

use App\Services\OrderNotificationService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class SendOrderFeedbackReminderNotification implements ShouldQueue
{
    use Queueable;

    public function __construct(public readonly int $orderId) {}

    public function handle(OrderNotificationService $orderNotificationService): void
    {
        $orderNotificationService->deliverFeedbackReminder($this->orderId);
    }
}
