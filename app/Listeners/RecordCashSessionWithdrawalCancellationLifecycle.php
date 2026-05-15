<?php

namespace App\Listeners;

use App\Events\CashSessionWithdrawalCancelled;
use App\Models\App\CashSession;
use App\Models\App\CashSessionLog;
use App\Services\OperationalAuditService;

class RecordCashSessionWithdrawalCancellationLifecycle
{
    public function __construct(private readonly OperationalAuditService $operationalAuditService) {}

    public function handle(CashSessionWithdrawalCancelled $event): void
    {
        $cashSession = CashSession::query()->find($event->cashSessionId);

        if (! $cashSession) {
            return;
        }

        CashSessionLog::create([
            'tenant_id' => $cashSession->tenant_id,
            'cash_session_id' => $cashSession->id,
            'user_id' => $event->actorId,
            'action' => 'withdrawal_cancelled',
            'data' => $event->data,
        ]);

        $this->operationalAuditService->record(
            'cash_session_withdrawal_cancelled',
            'cash_session',
            $cashSession,
            $event->actorId,
            $event->data,
        );
    }
}
