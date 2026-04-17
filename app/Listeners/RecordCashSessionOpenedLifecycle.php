<?php

namespace App\Listeners;

use App\Events\CashSessionOpened;
use App\Models\App\CashSession;
use App\Models\App\CashSessionLog;
use App\Services\OperationalAuditService;

class RecordCashSessionOpenedLifecycle
{
    public function __construct(private readonly OperationalAuditService $operationalAuditService) {}

    public function handle(CashSessionOpened $event): void
    {
        $cashSession = CashSession::query()->find($event->cashSessionId);

        if (! $cashSession) {
            return;
        }

        CashSessionLog::create([
            'tenant_id' => $cashSession->tenant_id,
            'cash_session_id' => $cashSession->id,
            'user_id' => $event->actorId,
            'action' => 'opened',
            'data' => $event->data,
        ]);

        $this->operationalAuditService->record(
            'cash_session_opened',
            'cash_session',
            $cashSession,
            $event->actorId,
            $event->data,
        );
    }
}
