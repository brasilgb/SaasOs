<?php

namespace App\Listeners;

use App\Events\MessageUpdated;
use App\Models\App\Message;
use App\Services\OperationalAuditService;

class RecordMessageUpdatedAudit
{
    public function __construct(private readonly OperationalAuditService $operationalAuditService) {}

    public function handle(MessageUpdated $event): void
    {
        $message = Message::query()->find($event->messageId);

        if (! $message) {
            return;
        }

        $this->operationalAuditService->record(
            'message_updated',
            'message',
            $message,
            $event->actorId,
            $event->data,
        );
    }
}
