<?php

namespace Database\Seeders;

use App\Models\Admin\Plan;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class PlanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        Plan::create([
            'name' => 'Trial 30 Dias',
            'slug' => Str::slug('Trial 30 Dias'),
            'description' => 'Plano de teste gratuito por 07 dias com acesso a todos os recursos.',
        ]);

        Plan::create([
            'name' => 'Plano Básico',
            'slug' => Str::slug('Plano Básico'),
            'description' => 'Acesso aos recursos essenciais do sistema.',
        ]);

        Plan::create([
            'name' => 'Plano Premium',
            'slug' => Str::slug('Plano Premium'),
            'description' => 'Acesso completo a todos os recursos e suporte prioritário.',
        ]);
    }
}