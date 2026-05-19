<?php

namespace Database\Factories\App;

use App\Models\App\PartMovement;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PartMovement>
 */
class PartMovementFactory extends Factory
{
    protected $model = PartMovement::class;

    public function definition(): array
    {
        return [
            'movement_type' => $this->faker->randomElement([
                PartMovement::TYPE_STOCK_IN,
                PartMovement::TYPE_ORDER_USE,
                PartMovement::TYPE_SALE,
                PartMovement::TYPE_ADJUSTMENT,
                PartMovement::TYPE_RETURN,
            ]),
            'quantity' => $this->faker->numberBetween(1, 5),
            'reason' => $this->faker->randomElement([
                'Ajuste de estoque',
                'Uso em ordem de servico',
                'Reposicao de estoque',
            ]),
        ];
    }

    public function forTenant(int $tenantId): static
    {
        return $this->state(fn () => ['tenant_id' => $tenantId]);
    }
}
