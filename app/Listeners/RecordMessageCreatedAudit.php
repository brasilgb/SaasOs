<?php

namespace App\Listeners;

use App\Events\MessageCreated;
use App\Models\App\Message;
use App\Services\OperationalAuditService;

class RecordMessageCreatedAudit
{
    public function __construct(private readonly OperationalAuditService $operationalAuditService) {}

    public function handle(MessageCreated $event): void
    {
        $message = Message::query()->find($event->messageId);

        if (! $message) {
            return;
        }

        $this->operationalAuditService->record(
            'message_created',
            'message',
            $message,
            $event->actorId,
            $event->data,
        );
    }
}
