<?php

namespace Database\Factories\App;

use App\Models\App\Order;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Order>
 */
class OrderFactory extends Factory
{
    protected $model = Order::class;

    /**
     * @var array<int, int>
     */
    protected static array $tenantSequence = [];

    public function definition(): array
    {
        $createdAt = $this->faker->dateTimeBetween('-3 months', 'now');
        $deliveryDate = $this->faker->optional(40)->dateTimeBetween($createdAt, 'now');

        return [
            'order_number' => $this->faker->unique()->numberBetween(1, 999999),
            'tracking_token' => Str::upper(Str::random(20)),
            'model' => $this->faker->randomElement(['Notebook Dell', 'PC Gamer', 'Macbook Pro', 'Celular Samsung']),
            'password' => $this->faker->optional()->password(6, 10),
            'defect' => $this->faker->sentence(6),
            'state_conservation' => $this->faker->randomElement(['bom estado', 'com avarias', 'nao liga']),
            'accessories' => $this->faker->randomElement(['carregador', 'mouse', 'teclado', 'nenhum']),
            'budget_description' => $this->faker->optional()->paragraph(),
            'budget_value' => $this->faker->optional()->randomFloat(2, 50, 1200),
            'service_status' => $this->faker->numberBetween(1, 4),
            'observations' => $this->faker->optional()->sentence(),
            'services_performed' => $this->faker->optional()->paragraph(),
            'parts_value' => $this->faker->optional()->randomFloat(2, 10, 600),
            'service_value' => $this->faker->optional()->randomFloat(2, 10, 900),
            'service_cost' => $this->faker->optional()->randomFloat(2, 10, 500),
            'delivery_forecast' => $this->faker->optional()->dateTimeBetween('now', '+20 days')?->format('Y-m-d'),
            'delivery_date' => $deliveryDate,
            'feedback' => $this->faker->optional()->boolean(),
            'created_at' => $createdAt,
            'updated_at' => $createdAt,
        ];
    }

    public function forTenant(int $tenantId): static
    {
        return $this->state(function () use ($tenantId): array {
            $next = static::$tenantSequence[$tenantId]
                ?? (Order::query()->where('tenant_id', $tenantId)->max('order_number') ?? 0);

            $next++;
            static::$tenantSequence[$tenantId] = $next;

            return [
                'tenant_id' => $tenantId,
                'order_number' => $next,
            ];
        });
    }
}
