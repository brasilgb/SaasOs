<?php

namespace App\Events;

use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MessageCreated
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public readonly int $messageId,
        public readonly ?int $actorId,
        public readonly array $data,
    ) {}
}
