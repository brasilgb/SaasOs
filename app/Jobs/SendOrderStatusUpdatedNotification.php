<?php

namespace App\Jobs;

use App\Services\OrderNotificationService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class SendOrderStatusUpdatedNotification implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public readonly int $orderId,
        public readonly string $statusLabel,
        public readonly ?string $observations = null,
    ) {}

    public function handle(OrderNotificationService $orderNotificationService): void
    {
        $orderNotificationService->deliverStatusUpdated($this->orderId, $this->statusLabel, $this->observations);
    }
}
