<?php

namespace Database\Factories\App;

use App\Models\App\Budget;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Budget>
 */
class BudgetFactory extends Factory
{
    protected $model = Budget::class;

    /**
     * @var array<int, int>
     */
    protected static array $tenantSequence = [];

    public function definition(): array
    {
        $partValue = $this->faker->randomFloat(2, 20, 500);
        $laborValue = $this->faker->randomFloat(2, 30, 700);

        return [
            'budget_number' => $this->faker->unique()->numberBetween(1, 999999),
            'model' => $this->faker->randomElement(['Notebook', 'Desktop', 'Smartphone', 'Tablet']),
            'service' => $this->faker->sentence(3),
            'description' => $this->faker->optional()->paragraph(),
            'estimated_time' => $this->faker->randomElement(['1 dia', '2 dias', '3 dias', '1 semana']),
            'part_value' => $partValue,
            'labor_value' => $laborValue,
            'total_value' => $partValue + $laborValue,
            'warranty' => $this->faker->randomElement(['30 dias', '60 dias', '90 dias']),
            'validity' => $this->faker->numberBetween(3, 15),
            'obs' => $this->faker->optional()->sentence(),
        ];
    }

    public function forTenant(int $tenantId): static
    {
        return $this->state(function () use ($tenantId): array {
            $next = static::$tenantSequence[$tenantId]
                ?? (Budget::query()->where('tenant_id', $tenantId)->max('budget_number') ?? 0);
            $next++;
            static::$tenantSequence[$tenantId] = $next;

            return [
                'tenant_id' => $tenantId,
                'budget_number' => $next,
            ];
        });
    }
}
