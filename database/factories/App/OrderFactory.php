<?php

namespace Database\Factories\App;

use App\Models\App\Order;
use App\Support\OrderStatus;
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
        $createdAt = $this->faker->dateTimeBetween('-60 days', 'now');
        $deliveryDate = $this->faker->optional(40)->dateTimeBetween($createdAt, 'now');
        $updatedAt = $this->faker->dateTimeBetween($createdAt, 'now');
        $partsValue = $this->faker->randomFloat(2, 0, 600);
        $serviceValue = $this->faker->randomFloat(2, 40, 900);
        $serviceCost = round($partsValue + $serviceValue, 2);

        return [
            'order_number' => $this->faker->unique()->numberBetween(1, 999999),
            'tracking_token' => Str::upper(Str::random(20)),
            'model' => $this->faker->randomElement(['Notebook Dell', 'PC Gamer', 'Macbook Pro', 'Celular Samsung']),
            'password' => $this->faker->optional()->password(6, 10),
            'defect' => $this->faker->sentence(6),
            'state_conservation' => $this->faker->randomElement(['bom estado', 'com avarias', 'nao liga']),
            'accessories' => $this->faker->randomElement(['carregador', 'mouse', 'teclado', 'nenhum']),
            'budget_description' => $this->faker->optional()->paragraph(),
            'budget_value' => $serviceCost,
            'service_status' => $this->faker->randomElement(OrderStatus::values()),
            'observations' => $this->faker->optional()->sentence(),
            'services_performed' => $this->faker->optional()->paragraph(),
            'parts_value' => $partsValue,
            'service_value' => $serviceValue,
            'service_cost' => $serviceCost,
            'delivery_forecast' => $this->faker->optional()->dateTimeBetween($createdAt, 'now')?->format('Y-m-d'),
            'delivery_date' => $deliveryDate,
            'warranty_days' => $this->faker->optional()->numberBetween(30, 180),
            'warranty_expires_at' => $deliveryDate ? $this->faker->optional()->dateTimeBetween($deliveryDate, '+180 days') : null,
            'is_warranty_return' => false,
            'warranty_source_order_id' => null,
            'feedback' => $this->faker->optional()->boolean(),
            'created_at' => $createdAt,
            'updated_at' => $updatedAt,
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
