<?php

namespace App\Policies;

use App\Models\App\Other;
use App\Models\App\PurchaseOrder;
use App\Models\User;

class PurchaseOrderPolicy
{
    private function canAccessPurchaseOrders(User $user): bool
    {
        if (! $user->hasPermission('purchase_orders')) {
            return false;
        }

        return Other::purchasesEnabled($user->tenant_id);
    }

    private function sameTenant(User $user, PurchaseOrder $purchaseOrder): bool
    {
        return (int) $user->tenant_id === (int) $purchaseOrder->tenant_id;
    }

    public function viewAny(User $user): bool
    {
        return $this->canAccessPurchaseOrders($user);
    }

    public function create(User $user): bool
    {
        return $this->canAccessPurchaseOrders($user);
    }

    public function update(User $user, PurchaseOrder $purchaseOrder): bool
    {
        return $this->canAccessPurchaseOrders($user) && $this->sameTenant($user, $purchaseOrder);
    }

    public function delete(User $user, PurchaseOrder $purchaseOrder): bool
    {
        return $this->canAccessPurchaseOrders($user) && $this->sameTenant($user, $purchaseOrder);
    }
}
