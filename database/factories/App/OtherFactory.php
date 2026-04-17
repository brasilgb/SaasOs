<?php

namespace Database\Factories\App;

use App\Models\App\Other;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Other>
 */
class OtherFactory extends Factory
{
    protected $model = Other::class;

    public function definition(): array
    {
        return [
            'navigation' => $this->faker->boolean(60),
            'enableparts' => $this->faker->boolean(75),
            'enablesales' => false,
            'show_follow_ups_menu' => false,
            'show_tasks_menu' => false,
            'show_commercial_performance_menu' => false,
            'show_quality_menu' => false,
            'automatic_follow_ups_enabled' => false,
        ];
    }

    public function forTenant(int $tenantId): static
    {
        return $this->state(fn () => ['tenant_id' => $tenantId]);
    }
}
