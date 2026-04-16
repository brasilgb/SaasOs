<?php

namespace App\Services;

use App\Models\App\Message;

class MessageService
{
    public function create(array $data, int $senderId): Message
    {
        $data['sender_id'] = $senderId;
        $data['message_number'] = Message::query()->max('message_number') + 1;

        return Message::create($data);
    }

    public function update(Message $message, array $data): Message
    {
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
