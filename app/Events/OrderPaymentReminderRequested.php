<?php

namespace App\Events;

use App\Models\App\Order;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class OrderPaymentReminderRequested
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public readonly Order $order,
        public readonly array $paymentSummary,
        public readonly bool $isOverdue,
    ) {}
}
