<?php

namespace App\Listeners;

use App\Events\CashSessionWithdrawalRegistered;
use App\Models\App\CashSession;
use App\Models\App\CashSessionLog;
use App\Services\OperationalAuditService;

class RecordCashSessionWithdrawalLifecycle
{
    public function __construct(private readonly OperationalAuditService $operationalAuditService) {}

    public function handle(CashSessionWithdrawalRegistered $event): void
    {
        $cashSession = CashSession::query()->find($event->cashSessionId);

        if (! $cashSession) {
            return;
        }

        CashSessionLog::create([
            'tenant_id' => $cashSession->tenant_id,
            'cash_session_id' => $cashSession->id,
            'user_id' => $event->actorId,
            'action' => 'withdrawal_registered',
            'data' => $event->data,
        ]);

        $this->operationalAuditService->record(
            'cash_session_withdrawal_registered',
            'cash_session',
            $cashSession,
            $event->actorId,
            $event->data,
        );
    }
}
