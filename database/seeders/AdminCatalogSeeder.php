<?php

namespace Database\Seeders;

use App\Models\Admin\Feature;
use App\Models\Admin\Period;
use App\Models\Admin\Plan;
use Illuminate\Database\Seeder;

class AdminCatalogSeeder extends Seeder
{
    public function run(): void
    {
        $plans = collect([
            [
                'name' => 'Plano Start',
                'slug' => 'plano-start',
                'value' => 99.90,
                'billing_months' => 1,
                'description' => 'Plano de entrada para oficinas pequenas.',
            ],
            [
                'name' => 'Plano Pro',
                'slug' => 'plano-pro',
                'value' => 199.90,
                'billing_months' => 1,
                'description' => 'Plano para operacoes com equipe e estoque.',
            ],
        ])->map(function (array $planData) {
            return Plan::query()->updateOrCreate(
                ['slug' => $planData['slug']],
                $planData,
            );
        });

        $periodDefinitions = [
            ['name' => 'Mensal', 'interval' => 'month', 'interval_count' => 1, 'price_multiplier' => 1],
            ['name' => 'Anual', 'interval' => 'year', 'interval_count' => 1, 'price_multiplier' => 10],
        ];

        $featureDefinitions = [
            ['name' => 'Ordens de Servico', 'order' => 1],
            ['name' => 'Clientes e Equipamentos', 'order' => 2],
            ['name' => 'Estoque e Pecas', 'order' => 3],
            ['name' => 'Financeiro e Caixa', 'order' => 4],
            ['name' => 'Follow-ups e Tarefas', 'order' => 5],
            ['name' => 'Indicadores e Relatorios', 'order' => 6],
        ];

        foreach ($plans as $plan) {
            collect($periodDefinitions)->each(function (array $periodData) use ($plan, $featureDefinitions): void {
                $period = Period::query()->firstOrCreate(
                    [
                        'plan_id' => $plan->id,
                        'interval' => $periodData['interval'],
                        'interval_count' => $periodData['interval_count'],
                    ],
                    [
                        'name' => $periodData['name'],
                        'price' => round((float) $plan->value * $periodData['price_multiplier'], 2),
                    ]
                );

                collect($featureDefinitions)->each(function (array $featureData) use ($period): void {
                    Feature::query()->firstOrCreate(
                        [
                            'period_id' => $period->id,
                            'name' => $featureData['name'],
                        ],
                        [
                            'order' => $featureData['order'],
                        ]
                    );
                });
            });
        }
    }
}
