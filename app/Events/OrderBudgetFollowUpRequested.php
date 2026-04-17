<?php

namespace App\Events;

use App\Models\App\Order;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class OrderBudgetFollowUpRequested
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public readonly Order $order,
        public readonly int $daysPending,
    ) {}
}
