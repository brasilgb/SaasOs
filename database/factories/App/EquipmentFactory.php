<?php

namespace Database\Factories\App;

use App\Models\App\Equipment;
use App\Models\Model;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Model>
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
            'equipment' => $this->faker->unique(true)->randomElement(['Notebook', 'PC', 'Mobile', 'Impressora']),
        ];
    }

    /**
     * Configura a factory para um tenant específico, garantindo que
     * o equipment_number seja sequencial para aquele tenant.
     *
     * @return Factory
     */
    public function forTenant(int $tenantId)
    {
        return $this->state(function (array $attributes) use ($tenantId) {
            $maxEquipmentNumber = Equipment::where('tenant_id', $tenantId)->max('equipment_number') ?? 0;

            return ['tenant_id' => $tenantId, 'equipment_number' => $maxEquipmentNumber + 1];
        });
    }
}
