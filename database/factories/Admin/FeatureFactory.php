<?php

namespace Database\Factories\Admin;

use App\Models\Admin\Feature;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Feature>
 */
class FeatureFactory extends Factory
{
    protected $model = Feature::class;

    public function definition(): array
    {
        return [
            'name' => $this->faker->randomElement([
                'Ordens de Servico',
                'Controle de Estoque',
                'Relatorios Avancados',
                'Agenda Tecnica',
                'Vendas',
            ]),
            'order' => $this->faker->numberBetween(1, 20),
        ];
    }
}
