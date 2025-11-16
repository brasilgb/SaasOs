<?php

namespace Database\Factories\App;

use App\Models\App\Equipment;
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
            "equipment" => $this->faker->unique()->randomElement(['Notebook', 'PC', 'Mobile', 'Impressora']),
        ];
    }

    /**
     * Configura a factory para um tenant específico, garantindo que
     * o equipment_number seja sequencial para aquele tenant.
     *
     * @param int $tenantId
     * @return \Illuminate\Database\Eloquent\Factories\Factory
     */
    public function forTenant(int $tenantId)
    {
        return $this->state(function (array $attributes) use ($tenantId) {
            $maxEquipmentNumber = Equipment::where('tenant_id', $tenantId)->max('equipment_number') ?? 0;

            return ['tenant_id' => $tenantId, 'equipment_number' => $maxEquipmentNumber + 1];
        });
    }
}
