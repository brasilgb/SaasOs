<?php

namespace App\Policies;

use App\Models\App\Schedule;
use App\Models\User;

class SchedulePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermission('schedules');
    }

    public function view(User $user, Schedule $schedule): bool
    {
        if (! $user->hasPermission('schedules')) {
            return false;
        }

        if (! $user->isTechnician()) {
            return true;
        }

        return (int) $schedule->user_id === (int) $user->id;
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('schedules') && ! $user->isTechnician();
    }

    public function update(User $user, Schedule $schedule): bool
    {
        return $this->create($user) && $this->view($user, $schedule);
    }

    public function delete(User $user, Schedule $schedule): bool
    {
        return $this->update($user, $schedule);
    }
}
