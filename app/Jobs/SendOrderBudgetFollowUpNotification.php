<?php

namespace App\Jobs;

use App\Services\OrderNotificationService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class SendOrderBudgetFollowUpNotification implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public readonly int $orderId,
        public readonly int $daysPending,
    ) {}

    public function handle(OrderNotificationService $orderNotificationService): void
    {
        $orderNotificationService->deliverBudgetFollowUp($this->orderId, $this->daysPending);
    }
}
