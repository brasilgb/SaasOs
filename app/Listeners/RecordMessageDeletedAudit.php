<?php

namespace App\Listeners;

use App\Events\MessageDeleted;
use App\Models\App\Message;
use App\Services\OperationalAuditService;

class RecordMessageDeletedAudit
{
    public function __construct(private readonly OperationalAuditService $operationalAuditService) {}

    public function handle(MessageDeleted $event): void
    {
        $message = Message::query()->find($event->messageId);

        if (! $message) {
            return;
        }

        $this->operationalAuditService->record(
            'message_deleted',
            'message',
            $message,
            $event->actorId,
            $event->data,
        );
    }
}
