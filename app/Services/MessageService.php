<?php

namespace App\Services;

use App\Models\App\Message;
use App\Models\User;
use App\Support\TenantSequence;

class MessageService
{
    public function create(array $data, int $senderId): Message
    {
        User::query()->whereKey($data['recipient_id'])->firstOrFail();

        $data['sender_id'] = $senderId;
        $data['message_number'] = TenantSequence::next(Message::class, 'message_number');

        return Message::create($data);
    }

    public function update(Message $message, array $data): Message
    {
        User::query()->whereKey($data['recipient_id'])->firstOrFail();

        $data['sender_id'] = $message->sender_id;
        $message->update($data);

        return $message->refresh();
    }

    public function updateReadStatus(Message $message, bool $status): Message
    {
        $message->update(['status' => $status]);

        return $message->refresh();
    }

    public function delete(Message $message): void
    {
        $message->delete();
    }
}
