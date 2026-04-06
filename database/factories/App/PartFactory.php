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
            'type' => $this->faker->randomElement(['part', 'accessory', 'component']),
            'is_sellable' => true,
            'category' => $this->faker->unique()->word(),
            'part_number' => $this->faker->unique()->numerify('PN-#######'),
            'reference_number' => $this->faker->unique()->numerify('REF-#######'),
            'name' => $this->faker->words(3, true),
            'description' => $this->faker->sentence,
            'manufacturer' => $this->faker->company(),
            'minimum_stock_level' => $this->faker->numberBetween(0, 10),
            'status' => true,
            'quantity' => $this->faker->numberBetween(0, 100),
            'cost_price' => $this->faker->randomFloat(2, 5, 500),
            'sale_price' => $this->faker->randomFloat(2, 5, 500),
        ];
    }

    public function forTenant(int $tenantId): static
    {
        return $this->state(fn () => ['tenant_id' => $tenantId]);
    }
}
