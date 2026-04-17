<?php

namespace App\Listeners;

use App\Events\OrderBudgetFollowUpRequested;
use App\Services\OrderNotificationService;

class SendOrderBudgetFollowUpNotification
{
    public function __construct(private readonly OrderNotificationService $orderNotificationService) {}

    public function handle(OrderBudgetFollowUpRequested $event): void
    {
        $this->orderNotificationService->sendBudgetFollowUp(
            $event->order,
            $event->daysPending,
        );
    }
}
