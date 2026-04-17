<?php

namespace App\Events;

use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class OrderLifecycleStatusChanged
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public readonly int $orderId,
        public readonly ?int $actorId,
        public readonly array $logData,
        public readonly array $auditData,
    ) {}
}
