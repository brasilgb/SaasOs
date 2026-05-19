<?php

namespace App\Policies;

use App\Models\App\CashSession;
use App\Models\App\Other;
use App\Models\User;

class CashSessionPolicy
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

    public function viewAny(User $user): bool
    {
        return $this->canAccessFinanceModule($user);
    }

    public function create(User $user): bool
    {
        return $this->canAccessFinanceModule($user);
    }

    public function update(User $user, CashSession $cashSession): bool
    {
        return $this->canAccessFinanceModule($user);
    }
}
