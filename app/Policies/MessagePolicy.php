<?php

namespace App\Policies;

use App\Models\App\Message;
use App\Models\User;

class MessagePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermission('messages');
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('messages');
    }

    public function view(User $user, Message $message): bool
    {
        if (! $user->hasPermission('messages')) {
            return false;
        }

        return (int) $message->sender_id === (int) $user->id
            || (int) $message->recipient_id === (int) $user->id;
    }

    public function update(User $user, Message $message): bool
    {
        return $this->create($user) && (int) $message->sender_id === (int) $user->id;
    }

    public function delete(User $user, Message $message): bool
    {
        return $this->update($user, $message);
    }

    public function markRead(User $user, Message $message): bool
    {
        return $this->create($user) && (int) $message->recipient_id === (int) $user->id;
    }
}
