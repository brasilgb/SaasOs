<?php

namespace App\Listeners;

use App\Events\CashSessionClosed;
use App\Models\App\CashSession;
use App\Models\App\CashSessionLog;
use App\Services\OperationalAuditService;

class RecordCashSessionClosedLifecycle
{
    public function __construct(private readonly OperationalAuditService $operationalAuditService) {}

    public function handle(CashSessionClosed $event): void
    {
        $cashSession = CashSession::query()->find($event->cashSessionId);

        if (! $cashSession) {
            return;
        }

        CashSessionLog::create([
            'tenant_id' => $cashSession->tenant_id,
            'cash_session_id' => $cashSession->id,
            'user_id' => $event->actorId,
            'action' => 'closed',
            'data' => $event->data,
        ]);

        $this->operationalAuditService->record(
            'cash_session_closed',
            'cash_session',
            $cashSession,
            $event->actorId,
            $event->data,
        );
    }
}
