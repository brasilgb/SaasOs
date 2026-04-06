<?php

namespace Database\Factories\App;

use App\Models\App\OrderStatusHistory;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<OrderStatusHistory>
 */
class OrderStatusHistoryFactory extends Factory
{
    protected $model = OrderStatusHistory::class;

    public function definition(): array
    {
        return [
            'status' => $this->faker->numberBetween(1, 4),
            'note' => $this->faker->sentence(6),
        ];
    }
}
