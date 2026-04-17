<?php

namespace App\Policies;

use App\Models\App\Expense;
use App\Models\App\Other;
use App\Models\User;

class ExpensePolicy
{
    private function canAccessSalesModule(User $user): bool
    {
        if (! $user->hasPermission('sales')) {
            return false;
        }

        if (! ($user->isAdministrator() || $user->isOperator() || $user->isRoot())) {
            return false;
        }

        return (bool) (Other::query()
            ->where('tenant_id', $user->tenant_id)
            ->value('enablesales') ?? false);
    }

    private function sameTenant(User $user, Expense $expense): bool
    {
        return (int) $user->tenant_id === (int) $expense->tenant_id;
    }

    public function viewAny(User $user): bool
    {
        return $this->canAccessSalesModule($user);
    }

    public function create(User $user): bool
    {
        return $this->canAccessSalesModule($user);
    }

    public function update(User $user, Expense $expense): bool
    {
        return $this->canAccessSalesModule($user) && $this->sameTenant($user, $expense);
    }

    public function delete(User $user, Expense $expense): bool
    {
        return $this->canAccessSalesModule($user) && $this->sameTenant($user, $expense);
    }
}
