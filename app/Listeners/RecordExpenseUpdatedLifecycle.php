<?php

namespace App\Listeners;

use App\Events\ExpenseUpdated;
use App\Models\App\Expense;
use App\Models\App\ExpenseLog;
use App\Services\OperationalAuditService;

class RecordExpenseUpdatedLifecycle
{
    public function __construct(private readonly OperationalAuditService $operationalAuditService) {}

    public function handle(ExpenseUpdated $event): void
    {
        $expense = Expense::query()->find($event->expenseId);

        if (! $expense) {
            return;
        }

        ExpenseLog::create([
            'tenant_id' => $expense->tenant_id,
            'expense_id' => $expense->id,
            'user_id' => $event->actorId,
            'action' => 'updated',
            'data' => $event->data,
        ]);

        $this->operationalAuditService->record(
            'expense_updated',
            'expense',
            $expense,
            $event->actorId,
            $event->data,
        );
    }
}
