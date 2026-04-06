<?php

namespace Database\Factories\App;

use App\Models\App\Part;
use App\Models\App\SaleItem;
use Illuminate\Database\Eloquent\Factories\Factory;

class SaleItemFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = SaleItem::class;

    /**
     * Define the model's default state.
     *
     * @return array
     */
    public function definition()
    {
        return [
            'part_id' => Part::query()->inRandomOrder()->value('id') ?? Part::factory(),
            'quantity' => $this->faker->numberBetween(1, 3),
            'unit_price' => $this->faker->randomFloat(2, 10, 200),
        ];
    }
}
