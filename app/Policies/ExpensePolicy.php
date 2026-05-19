<?php

namespace App\Policies;

use App\Models\App\Expense;
use App\Models\App\Other;
use App\Models\User;

class ExpensePolicy
{
    private function canAccessFinanceModule(User $user): bool
    {
        if (! $user->hasPermission('finance')) {
            return false;
        }

        if (! ($user->isAdministrator() || $user->isOperator() || $user->isRoot())) {
            return false;
        }

        return (bool) (Other::query()
            ->where('tenant_id', $user->tenant_id)
            ->value('enable_finance') ?? false);
    }

    private function sameTenant(User $user, Expense $expense): bool
    {
        return (int) $user->tenant_id === (int) $expense->tenant_id;
    }

    public function viewAny(User $user): bool
    {
        return $this->canAccessFinanceModule($user);
    }

    public function create(User $user): bool
    {
        return $this->canAccessFinanceModule($user);
    }

    public function update(User $user, Expense $expense): bool
    {
        return $this->canAccessFinanceModule($user) && $this->sameTenant($user, $expense);
    }

    public function delete(User $user, Expense $expense): bool
    {
        return $this->canAccessFinanceModule($user) && $this->sameTenant($user, $expense);
    }
}
