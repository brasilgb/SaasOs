<?php

namespace Database\Factories;

use App\Models\App\Part;
use App\Models\Tenant;
use Illuminate\Database\Eloquent\Factories\Factory;

class PartFactory extends Factory
{
    protected $model = Part::class;

    public function definition()
    {
        return [
            'name' => $this->faker->word,
            'quantity' => $this->faker->numberBetween(1, 100),
            'sale_price' => $this->faker->randomFloat(2, 10, 500),
            'tenant_id' => Tenant::factory(),
        ];
    }
}
