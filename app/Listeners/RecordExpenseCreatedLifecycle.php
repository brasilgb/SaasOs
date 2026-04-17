<?php

namespace App\Listeners;

use App\Events\ExpenseCreated;
use App\Models\App\Expense;
use App\Models\App\ExpenseLog;
use App\Services\OperationalAuditService;

class RecordExpenseCreatedLifecycle
{
    public function __construct(private readonly OperationalAuditService $operationalAuditService) {}

    public function handle(ExpenseCreated $event): void
    {
        $expense = Expense::query()->find($event->expenseId);

        if (! $expense) {
            return;
        }

        ExpenseLog::create([
            'tenant_id' => $expense->tenant_id,
            'expense_id' => $expense->id,
            'user_id' => $event->actorId,
            'action' => 'created',
            'data' => $event->data,
        ]);

        $this->operationalAuditService->record(
            'expense_created',
            'expense',
            $expense,
            $event->actorId,
            $event->data,
        );
    }
}
