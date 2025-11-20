<?php

namespace Database\Factories\App;

use App\Models\App\Part;
use Illuminate\Database\Eloquent\Factories\Factory;

class PartFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Part::class;

    /**
     * Define the model's default state.
     *
     * @return array
     */
    public function definition()
    {
        return [
            'part_number' => $this->faker->unique()->numerify('PN-#######'),
            'name' => $this->faker->words(3, true),
            'description' => $this->faker->sentence,
            'quantity' => $this->faker->numberBetween(0, 100),
            'cost_price' => $this->faker->randomFloat(2, 5, 500),
            'sale_price' => $this->faker->randomFloat(2, 5, 500),
        ];
    }
}