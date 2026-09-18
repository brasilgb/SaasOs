<?php

namespace Database\Factories\App;

use App\Models\App\CustomerEquipment;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<CustomerEquipment>
 */
class CustomerEquipmentFactory extends Factory
{
    protected $model = CustomerEquipment::class;

    /**
     * @var array<int, int>
     */
    protected static array $tenantSequence = [];

    public function definition(): array
    {
        return [
            'brand' => $this->faker->randomElement(['Samsung', 'Apple', 'Dell', 'Lenovo', 'Motorola']),
            'model' => $this->faker->word(),
            'serial_number' => $this->faker->optional()->bothify('SN-########'),
            'imei' => $this->faker->optional()->numerify('###############'),
            'color' => $this->faker->optional()->colorName(),
            'accessories' => $this->faker->optional()->sentence(),
            'notes' => $this->faker->optional()->sentence(),
            'status' => CustomerEquipment::STATUS_ACTIVE,
            'customer_equipment_number' => $this->faker->unique()->numberBetween(1, 999999),
        ];
    }

    public function forTenant(int $tenantId): static
    {
        return $this->state(function () use ($tenantId): array {
            $next = static::$tenantSequence[$tenantId]
                ?? (CustomerEquipment::query()->where('tenant_id', $tenantId)->max('customer_equipment_number') ?? 0);

            $next++;
            static::$tenantSequence[$tenantId] = $next;

            return [
                'tenant_id' => $tenantId,
                'customer_equipment_number' => $next,
            ];
        });
    }
}
