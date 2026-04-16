<?php

namespace App\Policies;

use App\Models\App\Other;
use App\Models\App\Sale;
use App\Models\User;

class SalePolicy
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

    public function view(User $user, Sale $sale): bool
    {
        return $this->canAccessSalesModule($user);
    }

    public function create(User $user): bool
    {
        return $this->canAccessSalesModule($user);
    }

    public function update(User $user, Sale $sale): bool
    {
        return $this->canAccessSalesModule($user);
    }

    public function delete(User $user, Sale $sale): bool
    {
        return $this->canAccessSalesModule($user);
    }
}
