<?php

namespace Database\Factories\App;

use App\Models\App\Equipment;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Equipment>
 */
class EquipmentFactory extends Factory
{
    protected $model = Equipment::class;

    /**
     * @var array<int, int>
     */
    protected static array $tenantSequence = [];

    public function definition(): array
    {
        return [
            'equipment' => $this->faker->randomElement(['Notebook', 'Desktop', 'Smartphone', 'Impressora']),
            'equipment_number' => $this->faker->unique()->numberBetween(1, 999999),
            'chart' => $this->faker->boolean(70),
        ];
    }

    public function forTenant(int $tenantId): static
    {
        return $this->state(function () use ($tenantId): array {
            $next = static::$tenantSequence[$tenantId]
                ?? (Equipment::query()->where('tenant_id', $tenantId)->max('equipment_number') ?? 0);

            $next++;
            static::$tenantSequence[$tenantId] = $next;

            return [
                'tenant_id' => $tenantId,
                'equipment_number' => $next,
            ];
        });
    }
}
