<?php

namespace Database\Factories\App;

use App\Models\App\Service;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Service>
 */
class ServiceFactory extends Factory
{
    protected $model = Service::class;

    public function definition(): array
    {
        return [
            'service_number' => $this->faker->unique()->numberBetween(1, 999999),
            'service' => $this->faker->randomElement([
                'Formatacao',
                'Troca de tela',
                'Limpeza interna',
                'Reparo de placa',
            ]),
            'description' => $this->faker->sentence(8),
            'status' => $this->faker->boolean(80),
        ];
    }

    public function forTenant(int $tenantId): static
    {
        return $this->state(fn () => ['tenant_id' => $tenantId]);
    }
}
