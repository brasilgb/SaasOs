<?php

namespace Database\Factories\App;

use App\Models\App\Message;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Message>
 */
class MessageFactory extends Factory
{
    protected $model = Message::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'message_number' => $this->faker->unique()->numerify('MSG-######'),
            'title' => $this->faker->sentence(4),
            'message' => $this->faker->paragraph(),
            'status' => $this->faker->boolean(),
        ];
    }

    public function forTenant(int $tenantId, ?int $senderId = null, ?int $recipientId = null): static
    {
        return $this->state(function () use ($tenantId, $senderId, $recipientId): array {
            return [
                'tenant_id' => $tenantId,
                'sender_id' => $senderId ?? User::query()->where('tenant_id', $tenantId)->inRandomOrder()->value('id'),
                'recipient_id' => $recipientId ?? User::query()->where('tenant_id', $tenantId)->inRandomOrder()->value('id'),
            ];
        });
    }
}
