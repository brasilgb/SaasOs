<?php

namespace App\Events;

use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class SaleDeleted
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public readonly int $saleId,
        public readonly ?int $actorId,
        public readonly array $auditData,
    ) {}
}
