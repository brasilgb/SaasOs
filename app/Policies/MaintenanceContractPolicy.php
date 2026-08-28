<?php

namespace App\Policies;

use App\Models\App\MaintenanceContract;
use App\Models\App\Other;
use App\Models\User;

class MaintenanceContractPolicy
{
    private function canAccessFinanceModule(User $user): bool
    {
        if (! $user->hasPermission('finance')) {
            return false;
        }

        if (! ($user->isAdministrator() || $user->isOperator() || $user->isRoot())) {
            return false;
        }

        return Other::financeEnabled($user->tenant_id);
    }

    private function sameTenant(User $user, MaintenanceContract $contract): bool
    {
        return (int) $user->tenant_id === (int) $contract->tenant_id;
    }

    public function viewAny(User $user): bool
    {
        return $this->canAccessFinanceModule($user);
    }

    public function create(User $user): bool
    {
        return $this->canAccessFinanceModule($user);
    }

    public function update(User $user, MaintenanceContract $contract): bool
    {
        return $this->canAccessFinanceModule($user) && $this->sameTenant($user, $contract);
    }

    public function delete(User $user, MaintenanceContract $contract): bool
    {
        return $this->canAccessFinanceModule($user) && $this->sameTenant($user, $contract);
    }
}
