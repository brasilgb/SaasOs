<?php

namespace App\Events;

use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class SaleCancelled
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public readonly int $saleId,
        public readonly ?int $actorId,
        public readonly array $logData,
        public readonly array $auditData,
    ) {}
}
