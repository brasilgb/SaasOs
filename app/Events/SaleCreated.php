<?php

namespace App\Events;

use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class SaleCreated
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public readonly int $saleId,
        public readonly ?int $actorId,
        public readonly array $data,
    ) {}
}
