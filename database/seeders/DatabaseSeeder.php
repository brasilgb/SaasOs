<?php

namespace Database\Seeders;

use App\Models\Tenant; // Supondo que você tenha um model Tenant
use App\Models\App\Customer;
use App\Models\App\Equipment;
use App\Models\App\Order;

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
        // 1. Crie alguns Tenants para sua plataforma
        $tenants = Tenant::factory(5)->create();

        // 2. Para cada Tenant, crie os dados específicos dele
        $tenants->each(function (Tenant $tenant) {
            // Use o método forTenant() que você já criou para garantir a sequência correta
            $customers = Customer::factory(20)->forTenant($tenant->id)->create();

            // Crie equipamentos PARA ESTE TENANT
            $equipments = Equipment::factory(10)->forTenant($tenant->id)->create();

            // Crie Ordens de Serviço PARA ESTE TENANT, associando a clientes e equipamentos DO MESMO TENANT
            Order::factory(50)
                ->forTenant($tenant->id) // Garante o order_number sequencial
                ->create([
                    'tenant_id' => $tenant->id,
                    'customer_id' => $customers->random()->id,
                    'equipment_id' => $equipments->random()->id,
                ]);
        });
    }
}