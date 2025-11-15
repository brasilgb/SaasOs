<?php

namespace Database\Factories\App;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Model>
 */
class EquipmentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            "tenant_id" => 1,
            "equipment_number" => '1',
            "equipment" => $this->faker->unique()->randomElement(['Notebook', 'PC', 'Mobile', 'Impressora']),
        ];
    }
}
