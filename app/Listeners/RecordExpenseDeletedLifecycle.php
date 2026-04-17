<?php

namespace App\Listeners;

use App\Events\ExpenseDeleted;
use App\Models\App\Expense;
use App\Models\App\ExpenseLog;
use App\Services\OperationalAuditService;

class RecordExpenseDeletedLifecycle
{
    public function __construct(private readonly OperationalAuditService $operationalAuditService) {}

    public function handle(ExpenseDeleted $event): void
    {
        $expense = Expense::query()->find($event->expenseId);

        if (! $expense) {
            return;
        }

        ExpenseLog::create([
            'tenant_id' => $expense->tenant_id,
            'expense_id' => $expense->id,
            'user_id' => $event->actorId,
            'action' => 'deleted',
            'data' => $event->data,
        ]);

        $this->operationalAuditService->record(
            'expense_deleted',
            'expense',
            $expense,
            $event->actorId,
            $event->data,
        );
    }
}
