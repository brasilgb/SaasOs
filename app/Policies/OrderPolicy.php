<?php

namespace App\Policies;

use App\Models\App\Order;
use App\Models\User;

class OrderPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermission('orders');
    }

    public function view(User $user, Order $order): bool
    {
        if (! $user->hasPermission('orders')) {
            return false;
        }

        if (! $user->isTechnician()) {
            return true;
        }

        return is_null($order->user_id) || (int) $order->user_id === (int) $user->id;
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('orders') && ! $user->isTechnician();
    }

    public function update(User $user, Order $order): bool
    {
        return $this->create($user) && $this->view($user, $order);
    }

    public function delete(User $user, Order $order): bool
    {
        return $this->update($user, $order);
    }
}
