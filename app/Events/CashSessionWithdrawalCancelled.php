<?php

namespace App\Events;

use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class CashSessionWithdrawalCancelled
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public readonly int $cashSessionId,
        public readonly ?int $actorId,
        public readonly array $data,
    ) {}
}
