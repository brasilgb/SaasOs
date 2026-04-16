<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    private function canManageRole(User $actor, mixed $role): bool
    {
        if ($actor->isRoot() || $actor->isAdministrator()) {
            return true;
        }

        if ($actor->isOperator()) {
            return in_array((int) $role, [User::ROLE_OPERATOR, User::ROLE_TECHNICIAN], true);
        }

        return false;
    }

    private function canManageTarget(User $actor, User $target): bool
    {
        return $this->canManageRole($actor, $target->roles);
    }

    public function viewAny(User $user): bool
    {
        return $user->hasPermission('users') || $user->hasPermission('users.view');
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('users') || $user->hasPermission('users.create');
    }

    public function view(User $user, User $target): bool
    {
        return $this->viewAny($user) && $this->canManageTarget($user, $target);
    }

    public function update(User $user, User $target): bool
    {
        return ($user->hasPermission('users') || $user->hasPermission('users.update'))
            && $this->canManageTarget($user, $target);
    }

    public function delete(User $user, User $target): bool
    {
        return ($user->hasPermission('users') || $user->hasPermission('users.delete'))
            && $this->canManageTarget($user, $target);
    }

    public function assignRole(User $user, mixed $role): bool
    {
        return $this->canManageRole($user, $role);
    }
}
