<?php

namespace App\Listeners;

use App\Events\OrderCreated;
use App\Services\N8nOrderClassificationService;

class NotifyN8nOrderCreated
{
    public function __construct(private readonly N8nOrderClassificationService $n8nOrderClassificationService) {}

    public function handle(OrderCreated $event): void
    {
        $this->n8nOrderClassificationService->notifyOrderCreated($event->order);
    }
}
