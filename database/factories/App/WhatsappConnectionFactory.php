<?php

namespace Database\Factories\App;

use App\Models\App\WhatsappConnection;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<WhatsappConnection>
 */
class WhatsappConnectionFactory extends Factory
{
    protected $model = WhatsappConnection::class;

    public function definition(): array
    {
        return [
            'session_name' => 'vetoros1-'.$this->faker->unique()->numberBetween(1, 999999),
            'status' => WhatsappConnection::STATUS_DISCONNECTED,
            'phone_number' => null,
        ];
    }

    public function connected(): static
    {
        return $this->state(fn () => [
            'status' => WhatsappConnection::STATUS_CONNECTED,
            'phone_number' => $this->faker->numerify('5551#########'),
            'connected_at' => now(),
        ]);
    }
}
