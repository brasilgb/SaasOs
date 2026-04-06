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
                'description' => 'Plano de entrada para oficinas pequenas.',
            ],
            [
                'name' => 'Plano Pro',
                'slug' => 'plano-pro',
                'value' => 199.90,
                'description' => 'Plano para operacoes com equipe e estoque.',
            ],
        ])->map(fn (array $planData) => Plan::query()->firstOrCreate(['slug' => $planData['slug']], $planData));

        foreach ($plans as $plan) {
            $periods = Period::factory(2)->create([
                'plan_id' => $plan->id,
            ]);

            $periods->each(function (Period $period): void {
                Feature::factory(6)->create([
                    'period_id' => $period->id,
                ]);
            });
        }
    }
}
