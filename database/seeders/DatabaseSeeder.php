<?php

namespace Database\Seeders;

use App\Models\App\Customer;
use App\Models\App\Equipment;
use App\Models\App\Message;
use App\Models\App\Order;
use App\Models\App\Part;
use App\Models\App\Sale;
use App\Models\App\Schedule;
use App\Models\Tenant;
use App\Models\User;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Popula os planos primeiro
        $this->call(PlanSeeder::class);

        // 1. Crie alguns Tenants para sua plataforma
        $tenants = Tenant::factory(5)->create();

        // 2. Para cada Tenant, crie os dados específicos dele
        $tenants->each(function (Tenant $tenant, $key) {
            // Reseta o estado do gerador de valores únicos para cada tenant
            fake()->unique(true);

            // Cria o usuário RootApp com e-mail previsível
            $mainUser = User::factory()->create([
                'tenant_id' => $tenant->id,
                'email' => 'tenant' . ($key + 1) . '@email.com',
                'roles' => 9, // RootApp
            ]);

            // Cria outros usuários para o mesmo tenant com papéis variados
            $otherUsers = User::factory(4)->create(['tenant_id' => $tenant->id]);
            $users = collect([$mainUser])->merge($otherUsers);

            // Use o método forTenant() que você já criou para garantir a sequência correta
            $customers = Customer::factory(50)->forTenant($tenant->id)->create();

            // Crie equipamentos PARA ESTE TENANT
            $equipments = Equipment::factory(4)->forTenant($tenant->id)->create();

            // Crie Peças (estoque) PARA ESTE TENANT
            Part::factory(50)->create(['tenant_id' => $tenant->id]);

            // Crie Ordens de Serviço PARA ESTE TENANT, associando a clientes e equipamentos DO MESMO TENANT
            Order::factory(200)
                ->forTenant($tenant->id) // Garante o order_number sequencial
                ->create([
                    'tenant_id' => $tenant->id,
                    'customer_id' => $customers->random()->id,
                    'equipment_id' => $equipments->random()->id,
                ]);

            // Crie Agendamentos (Schedules) PARA ESTE TENANT
            Schedule::factory(30)->create([
                'tenant_id' => $tenant->id,
                'customer_id' => fn () => $customers->random()->id,
                'user_id' => fn () => $users->random()->id,
            ]);

            // Crie Vendas (Sales) PARA ESTE TENANT
            // A SaleFactory já cuida de criar os SaleItems
            Sale::factory(40)->create([
                'tenant_id' => $tenant->id,
                'customer_id' => fn () => $customers->random()->id,
            ]);

            // Crie Mensagens (Messages) PARA ESTE TENANT
            Message::factory(15)->create([
                'tenant_id' => $tenant->id,
                'sender_id' => fn () => $users->random()->id,
                'recipient_id' => fn () => $users->random()->id,
            ]);
        });
    }
}