<?php

namespace App\Services;

use App\Models\App\Expense;
use App\Support\TenantSequence;
use Illuminate\Support\Facades\DB;

class ExpenseService
{
    public function create(array $data, int $userId): Expense
    {
        return DB::transaction(function () use ($data, $userId) {
            return Expense::create([
                ...$data,
                'expense_number' => TenantSequence::next(Expense::class, 'expense_number'),
                'created_by' => $userId,
            ]);
        });
    }

    public function update(Expense $expense, array $data): Expense
    {
        $expense->update($data);

        return $expense->fresh();
    }

    public function delete(Expense $expense): void
    {
        $expense->delete();
    }
}
