<?php

namespace Database\Factories\App;

use App\Models\Tenant;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Model>
 */
class MessageFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'tenant_id' => Tenant::factory(),
            'sender_id' => User::factory(),
            'recipient_id' => User::factory(),
            'message_number' => $this->faker->unique()->numerify('MSG-######'),
            'title' => $this->faker->sentence(4),
            'message' => $this->faker->paragraph,
            'status' => $this->faker->boolean,
        ];
    }
}
