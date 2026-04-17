<?php

namespace App\Listeners;

use App\Events\OrderCreated;
use App\Services\OrderNotificationService;

class SendOrderCreatedNotification
{
    public function __construct(private readonly OrderNotificationService $orderNotificationService) {}

    public function handle(OrderCreated $event): void
    {
        $this->orderNotificationService->sendCreated($event->order);
    }
}
