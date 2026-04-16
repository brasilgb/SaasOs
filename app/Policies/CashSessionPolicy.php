<?php

namespace App\Policies;

use App\Models\App\CashSession;
use App\Models\App\Other;
use App\Models\User;

class CashSessionPolicy
{
    private function canAccessSalesModule(User $user): bool
    {
        if (! $user->hasPermission('sales')) {
            return false;
        }

        if (! ($user->isAdministrator() || $user->isOperator() || $user->isRoot())) {
            return false;
        }

        return (bool) (Other::query()->value('enablesales') ?? false);
    }

    public function viewAny(User $user): bool
    {
        return $this->canAccessSalesModule($user);
    }

    public function create(User $user): bool
    {
        return $this->canAccessSalesModule($user);
    }

    public function update(User $user, CashSession $cashSession): bool
    {
        return $this->canAccessSalesModule($user);
    }
}
