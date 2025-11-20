<?php

namespace Database\Factories\App;

use App\Models\App\Customer;
use App\Models\App\Equipment;
use App\Models\App\Order;
use Illuminate\Database\Eloquent\Factories\Factory;
use Faker\Factory as FakerFactory;
/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Model>
 */
class OrderFactory extends Factory
{
    protected $model = Order::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $createdAt = $this->faker->dateTimeBetween('-3 months', 'now');
        $deliveryDays = $this->faker->randomElement([5, 8]);

        return [
            // ...
            "model" => $this->faker->randomElement(['Notebook Dell', 'PC Gamer', 'Macbook Pro', 'Celular Samsung']),
            "password" => $this->faker->optional()->password(6, 10),
            "defect" => $this->faker->sentence(4),
            "state_conservation" => $this->faker->randomElement(['bom estado', 'com avarias', 'não liga']),
            "accessories" => $this->faker->randomElement(['carregador', 'mouse', 'nenhum']),
            "budget_description" => $this->faker->paragraph,
            "budget_value" => $this->faker->randomFloat(2, 50, 1000),
            "service_status" => $this->faker->randomElement(['1', '2', '3', '4']), // Orçamento, Aprovado, etc.
            "delivery_forecast" => (clone $createdAt)->modify("+$deliveryDays days"),
            "observations" => $this->faker->optional()->sentence,
            "services_performed" => $this->faker->optional()->paragraph,
            "parts" => $this->faker->optional()->words(3, true),

            "delivery_date" => $this->faker->optional()->date('Y-m-d'),
            "responsible_technician" => $this->faker->name,
            'created_at' => $createdAt,
            'updated_at' => $createdAt,
        ];
    }

    /**
     * Configura a factory para um tenant específico, garantindo que
     * o order_number seja sequencial para aquele tenant.
     */
    public function forTenant(int $tenantId)
    {
        return $this->state(function (array $attributes) use ($tenantId) {
            $maxOrderNumber = Order::where('tenant_id', $tenantId)->max('order_number') ?? 0;

            return ['order_number' => $maxOrderNumber + 1];
        });
    }
}
