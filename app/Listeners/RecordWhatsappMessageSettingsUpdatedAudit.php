<?php

namespace App\Listeners;

use App\Events\WhatsappMessageSettingsUpdated;
use App\Models\App\WhatsappMessage;
use App\Services\OperationalAuditService;

class RecordWhatsappMessageSettingsUpdatedAudit
{
    public function __construct(private readonly OperationalAuditService $operationalAuditService) {}

    public function handle(WhatsappMessageSettingsUpdated $event): void
    {
        $settings = WhatsappMessage::query()->find($event->settingsId);

        if (! $settings) {
            return;
        }

        $this->operationalAuditService->record(
            'whatsapp_message_settings_updated',
            'whatsapp_message_settings',
            $settings,
            $event->actorId,
            $event->data,
        );
    }
}
