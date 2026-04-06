<?php

namespace Database\Factories\Admin;

use App\Models\Admin\Period;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Period>
 */
class PeriodFactory extends Factory
{
    protected $model = Period::class;

    public function definition(): array
    {
        $interval = $this->faker->randomElement(['month', 'year']);
        $count = $interval === 'month' ? $this->faker->randomElement([1, 3, 6]) : 1;

        return [
            'name' => ucfirst($interval).' '.$count,
            'interval' => $interval,
            'interval_count' => $count,
            'price' => $this->faker->randomFloat(2, 39, 799),
        ];
    }
}
