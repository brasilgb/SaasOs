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

        return (bool) (Other::query()
            ->where('tenant_id', $user->tenant_id)
            ->value('enablesales') ?? false);
    }

    private function sameTenant(User $user, Sale $sale): bool
    {
        return (int) $user->tenant_id === (int) $sale->tenant_id;
    }

    public function viewAny(User $user): bool
    {
        return $this->canAccessSalesModule($user);
    }

    public function view(User $user, Sale $sale): bool
    {
        return $this->canAccessSalesModule($user) && $this->sameTenant($user, $sale);
    }

    public function create(User $user): bool
    {
        return $this->canAccessSalesModule($user);
    }

    public function update(User $user, Sale $sale): bool
    {
        return $this->canAccessSalesModule($user) && $this->sameTenant($user, $sale);
    }

    public function delete(User $user, Sale $sale): bool
    {
        return $this->canAccessSalesModule($user) && $this->sameTenant($user, $sale);
    }
}
