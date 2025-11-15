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
        // A instância do faker da factory ($this->faker) já está disponível.
        // Se precisar do locale pt_BR, configure-o globalmente no AppServiceProvider.
        return [
            // Cria um Customer e associa o tenant_id da Ordem ao tenant_id do Cliente.
            // Isso garante a consistência dos dados.
            "customer_id" => Customer::inRandomOrder()->value('id'),//id aleatorio,
            "tenant_id" => function (array $attributes) {
                return Customer::find($attributes['customer_id'])->tenant_id;
            },
            "equipment_id" => Equipment::inRandomOrder()->value('id'), //id aleatorio
            "order_number" => 1, // Este valor será sobrescrito pelo estado 'forTenant'
            "model" => $this->faker->randomElement(['Notebook Dell', 'PC Gamer', 'Macbook Pro', 'Celular Samsung']),
            "password" => $this->faker->optional()->password(6, 10),
            "defect" => $this->faker->sentence(4),
            "state_conservation" => $this->faker->randomElement(['bom estado', 'com avarias', 'não liga']),
            "accessories" => $this->faker->randomElement(['carregador', 'mouse', 'nenhum']),
            "budget_description" => $this->faker->paragraph,
            "budget_value" => $this->faker->randomFloat(2, 50, 1000),
            "service_status" => $this->faker->randomElement(['1', '2', '3', '4']), // Orçamento, Aprovado, etc.
            "delivery_forecast" => $this->faker->dateTimeBetween('+1 day', '+2 weeks'),
            "observations" => $this->faker->optional()->sentence,
            "services_performed" => $this->faker->optional()->paragraph,
            "parts" => $this->faker->optional()->words(3, true),

            "delivery_date" => $this->faker->optional()->date('Y-m-d'),
            "responsible_technician" => $this->faker->name,
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
