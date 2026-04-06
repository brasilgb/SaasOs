<?php

namespace Database\Factories\App;

use App\Models\App\Schedule;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Schedule>
 */
class ScheduleFactory extends Factory
{
    protected $model = Schedule::class;

    /**
     * @var array<int, int>
     */
    protected static array $tenantSequence = [];

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition()
    {
        return [
            'schedules_number' => $this->faker->unique()->numberBetween(1, 10000),
            'schedules' => $this->faker->dateTimeBetween('+1 day', '+1 month'),
            'service' => $this->faker->sentence(3),
            'details' => $this->faker->paragraph(),
            'status' => $this->faker->numberBetween(1, 4),
            'observations' => $this->faker->optional()->sentence(),
            'responsible_technician' => $this->faker->name(),
        ];
    }

    public function forTenant(int $tenantId): static
    {
        return $this->state(function () use ($tenantId): array {
            $next = static::$tenantSequence[$tenantId]
                ?? (Schedule::query()->where('tenant_id', $tenantId)->max('schedules_number') ?? 0);

            $next++;
            static::$tenantSequence[$tenantId] = $next;

            return [
                'tenant_id' => $tenantId,
                'schedules_number' => $next,
            ];
        });
    }
}
