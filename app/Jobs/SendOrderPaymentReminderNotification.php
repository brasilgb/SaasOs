<?php

namespace App\Jobs;

use App\Services\OrderNotificationService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class SendOrderPaymentReminderNotification implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public readonly int $orderId,
        public readonly array $paymentSummary,
        public readonly bool $isOverdue,
    ) {}

    public function handle(OrderNotificationService $orderNotificationService): void
    {
        $orderNotificationService->deliverPaymentReminder($this->orderId, $this->paymentSummary, $this->isOverdue);
    }
}
