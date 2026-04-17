<?php

namespace App\Listeners;

use App\Events\MessageReadStatusUpdated;
use App\Models\App\Message;
use App\Services\OperationalAuditService;

class RecordMessageReadStatusUpdatedAudit
{
    public function __construct(private readonly OperationalAuditService $operationalAuditService) {}

    public function handle(MessageReadStatusUpdated $event): void
    {
        $message = Message::query()->find($event->messageId);

        if (! $message) {
            return;
        }

        $this->operationalAuditService->record(
            'message_read_status_updated',
            'message',
            $message,
            $event->actorId,
            $event->data,
        );
    }
}
