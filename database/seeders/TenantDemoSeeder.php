<?php

namespace Database\Seeders;

use App\Models\Admin\Branch;
use App\Models\Admin\Plan;
use App\Models\Admin\Setting;
use App\Models\App\Budget;
use App\Models\App\Checklist;
use App\Models\App\Company;
use App\Models\App\Customer;
use App\Models\App\Equipment;
use App\Models\App\Image;
use App\Models\App\Message;
use App\Models\App\Order;
use App\Models\App\OrderStatusHistory;
use App\Models\App\Other;
use App\Models\App\Part;
use App\Models\App\PartMovement;
use App\Models\App\Payment;
use App\Models\App\Receipt;
use App\Models\App\Sale;
use App\Models\App\SaleItem;
use App\Models\App\Schedule;
use App\Models\App\WhatsappMessage;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class TenantDemoSeeder extends Seeder
{
    public function run(): void
    {
        $demoTenantEmails = ['tenant1@email.com', 'tenant2@email.com'];

        $this->cleanupDemoTenants($demoTenantEmails);

        $plans = Plan::query()->whereIn('slug', ['plano-start', 'plano-pro'])->get()->values();

        $tenants = collect([
            [
                'name' => 'Tenant Demo 1',
                'company' => 'Oficina Demo Alpha',
                    'email' => $demoTenantEmails[0],
                ],
                [
                    'name' => 'Tenant Demo 2',
                    'company' => 'Assistencia Demo Beta',
                    'email' => $demoTenantEmails[1],
                ],
            ])->map(function (array $seed, int $index) use ($plans): Tenant {
            return Tenant::factory()->create([
                'plan_id' => $plans[$index % $plans->count()]->id,
                'name' => $seed['name'],
                'company' => $seed['company'],
                'email' => $seed['email'],
            ]);
        });

        $tenants->each(function (Tenant $tenant, int $tenantIndex): void {
            $this->seedTenantData($tenant, $tenantIndex);
        });
    }

    private function cleanupDemoTenants(array $emails): void
    {
        $tenantIds = Tenant::query()->whereIn('email', $emails)->pluck('id');
        if ($tenantIds->isEmpty()) {
            return;
        }

        $orderIds = Order::query()->whereIn('tenant_id', $tenantIds)->pluck('id');
        $saleIds = Sale::query()->whereIn('tenant_id', $tenantIds)->pluck('id');

        if ($saleIds->isNotEmpty()) {
            DB::table('sale_items')->whereIn('sale_id', $saleIds)->delete();
        }

        if ($orderIds->isNotEmpty()) {
            DB::table('order_parts')->whereIn('order_id', $orderIds)->delete();
            DB::table('order_payments')->whereIn('order_id', $orderIds)->delete();
            DB::table('order_logs')->whereIn('order_id', $orderIds)->delete();
            OrderStatusHistory::query()->whereIn('order_id', $orderIds)->delete();
            Image::query()->whereIn('order_id', $orderIds)->delete();
        }

        PartMovement::query()->whereIn('tenant_id', $tenantIds)->delete();
        Message::query()->whereIn('tenant_id', $tenantIds)->delete();
        Schedule::query()->whereIn('tenant_id', $tenantIds)->delete();
        Payment::query()->whereIn('tenant_id', $tenantIds)->delete();
        Budget::query()->whereIn('tenant_id', $tenantIds)->delete();
        Checklist::query()->whereIn('tenant_id', $tenantIds)->delete();
        Sale::query()->whereIn('tenant_id', $tenantIds)->delete();
        Order::query()->whereIn('tenant_id', $tenantIds)->delete();
        Part::query()->whereIn('tenant_id', $tenantIds)->delete();
        Customer::query()->whereIn('tenant_id', $tenantIds)->delete();
        Equipment::query()->whereIn('tenant_id', $tenantIds)->delete();
        Company::query()->whereIn('tenant_id', $tenantIds)->delete();
        Branch::query()->whereIn('tenant_id', $tenantIds)->delete();
        Setting::query()->whereIn('tenant_id', $tenantIds)->delete();
        Other::query()->whereIn('tenant_id', $tenantIds)->delete();
        Receipt::query()->whereIn('tenant_id', $tenantIds)->delete();
        WhatsappMessage::query()->whereIn('tenant_id', $tenantIds)->delete();
        User::query()->whereIn('tenant_id', $tenantIds)->delete();
        Tenant::query()->whereIn('id', $tenantIds)->delete();
    }

    private function seedTenantData(Tenant $tenant, int $tenantIndex): void
    {
        $users = $this->seedUsers($tenant, $tenantIndex);
        $technicians = $users->where('roles', User::ROLE_TECHNICIAN)->values();

        Company::factory()->forTenant($tenant->id)->create([
            'companyname' => $tenant->company,
            'email' => $tenant->email,
            'cnpj' => $tenant->cnpj,
        ]);

        Branch::factory(2)->forTenant($tenant->id)->create();
        Setting::factory()->forTenant($tenant->id)->create(['name' => $tenant->name]);
        Other::factory()->forTenant($tenant->id)->create();
        Receipt::factory()->forTenant($tenant->id)->create();
        WhatsappMessage::factory()->forTenant($tenant->id)->create();

        $equipments = Equipment::factory(12)->forTenant($tenant->id)->create();

        $equipments->each(function (Equipment $equipment) use ($tenant): void {
            Checklist::factory(2)->forTenant($tenant->id)->create([
                'equipment_id' => $equipment->id,
            ]);
        });

        Budget::factory(24)->forTenant($tenant->id)->create([
            'equipment_id' => fn () => $equipments->random()->id,
        ]);

        $customers = Customer::factory(40)->forTenant($tenant->id)->create();
        $parts = Part::factory(60)->forTenant($tenant->id)->create();

        $orders = Order::factory(80)->forTenant($tenant->id)->create([
            'customer_id' => fn () => $customers->random()->id,
            'equipment_id' => fn () => $equipments->random()->id,
            'user_id' => fn () => $technicians->isNotEmpty() ? $technicians->random()->id : $users->random()->id,
        ]);

        Schedule::factory(36)->forTenant($tenant->id)->create([
            'customer_id' => fn () => $customers->random()->id,
            'user_id' => fn () => $technicians->isNotEmpty() ? $technicians->random()->id : $users->random()->id,
            'responsible_technician' => fn () => $technicians->isNotEmpty() ? $technicians->random()->name : $users->random()->name,
        ]);

        Message::factory(40)->forTenant($tenant->id)->create([
            'sender_id' => fn () => $users->random()->id,
            'recipient_id' => fn () => $users->random()->id,
        ]);

        $this->seedOrderRelatedData($tenant, $orders, $parts, $users);
        $this->seedSales($tenant, $customers, $parts);

        Payment::factory(3)->forTenant($tenant->id)->create([
            'amount' => $tenant->plan?->value ?? 99.90,
        ]);
    }

    private function seedUsers(Tenant $tenant, int $tenantIndex)
    {
        $mainUser = User::factory()->forTenant($tenant->id)->create([
            'email' => 'tenant'.($tenantIndex + 1).'@email.com',
            'roles' => User::ROLE_ROOT_APP,
            'status' => 1,
        ]);

        $admin = User::factory()->forTenant($tenant->id)->create([
            'roles' => User::ROLE_ADMIN,
            'status' => 1,
        ]);

        $operator = User::factory()->forTenant($tenant->id)->create([
            'roles' => User::ROLE_OPERATOR,
            'status' => 1,
        ]);

        $technicians = User::factory(2)->forTenant($tenant->id)->create([
            'roles' => User::ROLE_TECHNICIAN,
            'status' => 1,
        ]);

        return collect([$mainUser, $admin, $operator])->merge($technicians);
    }

    private function seedOrderRelatedData(Tenant $tenant, $orders, $parts, $users): void
    {
        foreach ($orders as $order) {
            $selectedParts = $parts->random(random_int(1, 3));
            $partsForOrder = $selectedParts instanceof Part ? collect([$selectedParts]) : $selectedParts;

            foreach ($partsForOrder as $part) {
                $quantity = random_int(1, 3);

                DB::table('order_parts')->insert([
                    'order_id' => $order->id,
                    'part_id' => $part->id,
                    'quantity' => $quantity,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                PartMovement::factory()->forTenant($tenant->id)->create([
                    'part_id' => $part->id,
                    'order_id' => $order->id,
                    'user_id' => $users->random()->id,
                    'movement_type' => 'saida',
                    'quantity' => $quantity,
                    'reason' => 'Uso em ordem #'.$order->order_number,
                ]);
            }

            OrderStatusHistory::factory(2)->create([
                'order_id' => $order->id,
                'changed_by' => $users->random()->id,
            ]);

            DB::table('order_payments')->insert([
                'order_id' => $order->id,
                'amount' => $order->budget_value ?? random_int(100, 1000),
                'payment_method' => collect(['pix', 'cartao', 'dinheiro'])->random(),
                'paid_at' => now()->subDays(random_int(0, 20)),
                'notes' => sprintf(
                    'Pagamento OS #%s - %s (seed tenant %s)',
                    $order->order_number,
                    $order->customer?->name ?? 'Cliente',
                    $tenant->id
                ),
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            DB::table('order_logs')->insert([
                'order_id' => $order->id,
                'user_id' => $users->random()->id,
                'action' => collect(['created', 'status_changed', 'payment_registered'])->random(),
                'data' => json_encode(['token' => Str::random(8), 'seed' => true], JSON_THROW_ON_ERROR),
                'created_at' => now()->subDays(random_int(0, 30)),
            ]);

            Image::factory(random_int(0, 2))->forTenant($tenant->id)->create([
                'order_id' => $order->id,
            ]);
        }
    }

    private function seedSales(Tenant $tenant, $customers, $parts): void
    {
        for ($i = 0; $i < 30; $i++) {
            $sale = Sale::factory()->forTenant($tenant->id)->create([
                'customer_id' => $customers->random()->id,
                'status' => 'completed',
                'cancelled_at' => null,
                'total_amount' => 0,
                'paid_amount' => 0,
                'financial_status' => 'pending',
                'payment_method' => collect(['pix', 'cartao', 'dinheiro', 'transferencia', 'boleto'])->random(),
            ]);

            $selectedParts = $parts->random(random_int(1, 4));
            $saleParts = $selectedParts instanceof Part ? collect([$selectedParts]) : $selectedParts;

            $total = 0;
            foreach ($saleParts as $part) {
                $quantity = min(random_int(1, 3), max(1, (int) $part->quantity));
                $lineTotal = $quantity * (float) $part->sale_price;
                $total += $lineTotal;

                SaleItem::factory()->create([
                    'sale_id' => $sale->id,
                    'part_id' => $part->id,
                    'quantity' => $quantity,
                    'unit_price' => $part->sale_price,
                ]);
            }

            $paidAmount = round((float) collect([
                0,
                $total / 2,
                $total,
            ])->random(), 2);

            $financialStatus = $paidAmount <= 0 ? 'pending' : ($paidAmount < $total ? 'partial' : 'paid');

            $sale->update([
                'total_amount' => $total,
                'paid_amount' => $paidAmount,
                'financial_status' => $financialStatus,
            ]);
        }
    }
}
