<?php

namespace App\Listeners;

use App\Events\OrderStatusUpdated;
use App\Services\OrderNotificationService;

class SendOrderStatusUpdatedNotification
{
    public function __construct(private readonly OrderNotificationService $orderNotificationService) {}

    public function handle(OrderStatusUpdated $event): void
    {
        $this->orderNotificationService->sendStatusUpdated(
            $event->order,
            $event->statusLabel,
            $event->observations,
        );
    }
}
