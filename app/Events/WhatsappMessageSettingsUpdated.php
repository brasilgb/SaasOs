<?php

namespace App\Events;

use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class WhatsappMessageSettingsUpdated
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public readonly int $settingsId,
        public readonly ?int $actorId,
        public readonly array $data,
    ) {}
}
