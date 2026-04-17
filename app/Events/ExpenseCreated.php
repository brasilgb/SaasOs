<?php

namespace App\Events;

use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ExpenseCreated
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public readonly int $expenseId,
        public readonly ?int $actorId,
        public readonly array $data,
    ) {}
}
