<?php

namespace Database\Factories\App;

use App\Models\App\Sale;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Sale>
 */
class SaleFactory extends Factory
{
    protected $model = Sale::class;

    /**
     * @var array<int, int>
     */
    protected static array $tenantSequence = [];

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition()
    {
        return [
            'sales_number' => $this->faker->unique()->numberBetween(1, 10000),
            'total_amount' => $total = $this->faker->randomFloat(2, 20, 1000),
            'paid_amount' => $paid = $this->faker->randomFloat(2, 0, $total),
            'financial_status' => $paid <= 0 ? 'pending' : ($paid < $total ? 'partial' : 'paid'),
            'payment_method' => $this->faker->randomElement(['pix', 'cartao', 'dinheiro', 'transferencia', 'boleto']),
            'status' => $this->faker->randomElement(['completed', 'cancelled']),
            'cancelled_at' => fn (array $attributes) => ($attributes['status'] ?? null) === 'cancelled'
                ? $this->faker->dateTimeBetween('-30 days', 'now')
                : null,
        ];
    }

    public function forTenant(int $tenantId): static
    {
        return $this->state(function () use ($tenantId): array {
            $next = static::$tenantSequence[$tenantId]
                ?? (Sale::query()->where('tenant_id', $tenantId)->max('sales_number') ?? 0);

            $next++;
            static::$tenantSequence[$tenantId] = $next;

            return [
                'tenant_id' => $tenantId,
                'sales_number' => $next,
            ];
        });
    }
}
