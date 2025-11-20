<?php

namespace Database\Factories\App;

use App\Models\App\Customer;
use App\Models\App\Schedule;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\App\Schedule>
 */
class ScheduleFactory extends Factory
{
    protected $model = Schedule::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition()
    {
        return [
            'tenant_id' => Tenant::factory(),
            'customer_id' => Customer::factory(),
            'user_id' => User::factory(), // Assumindo que user_id é o técnico responsável
            'schedules_number' => $this->faker->unique()->numberBetween(1, 10000),
            'schedules' => $this->faker->dateTimeBetween('+1 day', '+1 month'),
            'service' => $this->faker->sentence(3),
            'details' => $this->faker->paragraph,
            'status' => $this->faker->numberBetween(1, 4), // Assumindo alguns status
            'observations' => $this->faker->optional()->sentence,
            'responsible_technician' => $this->faker->name,
        ];
    }
}
