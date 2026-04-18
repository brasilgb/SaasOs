<?php

namespace Database\Seeders;

use App\Models\Admin\Branch;
use App\Models\Admin\Plan;
use App\Models\Admin\Setting;
use App\Models\App\Budget;
use App\Models\App\CashSession;
use App\Models\App\CashSessionLog;
use App\Models\App\Checklist;
use App\Models\App\Company;
use App\Models\App\Customer;
use App\Models\App\Equipment;
use App\Models\App\Expense;
use App\Models\App\ExpenseLog;
use App\Models\App\Image;
use App\Models\App\Message;
use App\Models\App\OperationalAudit;
use App\Models\App\Order;
use App\Models\App\OrderLog;
use App\Models\App\OrderPayment;
use App\Models\App\OrderStatusHistory;
use App\Models\App\Other;
use App\Models\App\Part;
use App\Models\App\PartMovement;
use App\Models\App\Payment;
use App\Models\App\Receipt;
use App\Models\App\Sale;
use App\Models\App\SaleItem;
use App\Models\App\SaleLog;
use App\Models\App\Schedule;
use App\Models\App\WhatsappMessage;
use App\Models\Tenant;
use App\Models\User;
use App\Support\OrderStatus;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
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
        $expenseIds = Expense::query()->whereIn('tenant_id', $tenantIds)->pluck('id');
        $cashSessionIds = CashSession::query()->whereIn('tenant_id', $tenantIds)->pluck('id');

        if ($saleIds->isNotEmpty()) {
            DB::table('sale_items')->whereIn('sale_id', $saleIds)->delete();
            SaleLog::query()->whereIn('sale_id', $saleIds)->delete();
        }

        if ($orderIds->isNotEmpty()) {
            DB::table('order_parts')->whereIn('order_id', $orderIds)->delete();
            DB::table('order_payments')->whereIn('order_id', $orderIds)->delete();
            DB::table('order_logs')->whereIn('order_id', $orderIds)->delete();
            OrderStatusHistory::query()->whereIn('order_id', $orderIds)->delete();
            Image::query()->whereIn('order_id', $orderIds)->delete();
        }

        if ($expenseIds->isNotEmpty()) {
            ExpenseLog::query()->whereIn('expense_id', $expenseIds)->delete();
        }

        if ($cashSessionIds->isNotEmpty()) {
            CashSessionLog::query()->whereIn('cash_session_id', $cashSessionIds)->delete();
        }

        OperationalAudit::query()->whereIn('tenant_id', $tenantIds)->delete();
        PartMovement::query()->whereIn('tenant_id', $tenantIds)->delete();
        Message::query()->whereIn('tenant_id', $tenantIds)->delete();
        Schedule::query()->whereIn('tenant_id', $tenantIds)->delete();
        Payment::query()->whereIn('tenant_id', $tenantIds)->delete();
        Budget::query()->whereIn('tenant_id', $tenantIds)->delete();
        Checklist::query()->whereIn('tenant_id', $tenantIds)->delete();
        Expense::query()->whereIn('tenant_id', $tenantIds)->delete();
        CashSession::query()->whereIn('tenant_id', $tenantIds)->delete();
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
        $windowStart = now()->subDays(60)->startOfDay();
        $windowEnd = now()->endOfDay();

        $users = $this->seedUsers($tenant, $tenantIndex);
        $technicians = $users->where('roles', User::ROLE_TECHNICIAN)->values();
        $backofficeUsers = $users->whereIn('roles', [User::ROLE_ROOT_APP, User::ROLE_ADMIN, User::ROLE_OPERATOR])->values();

        Company::factory()->forTenant($tenant->id)->create([
            'shortname' => Str::limit($tenant->company, 12, ''),
            'companyname' => $tenant->company,
            'email' => $tenant->email,
            'cnpj' => $tenant->cnpj,
        ]);

        Branch::factory(2)->forTenant($tenant->id)->create();
        Setting::factory()->forTenant($tenant->id)->create(['name' => $tenant->name]);
        Other::factory()->forTenant($tenant->id)->create([
            'enableparts' => true,
            'enablesales' => true,
            'show_follow_ups_menu' => true,
            'show_tasks_menu' => true,
            'show_commercial_performance_menu' => true,
            'show_quality_menu' => true,
            'automatic_follow_ups_enabled' => true,
            'communication_follow_up_cooldown_days' => 2,
            'customer_feedback_request_delay_days' => 5,
            'budget_conversion_target' => 65,
            'payment_recovery_target' => 75,
            'warranty_return_alert_threshold' => 8,
        ]);
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

        $this->spreadTimestamps(Budget::query()->where('tenant_id', $tenant->id)->latest('id')->take(24)->get(), $windowStart, $windowEnd);
        $this->spreadTimestamps($customers, $windowStart, $windowEnd);
        $this->spreadTimestamps($parts, $windowStart, $windowEnd);

        $cashSessions = $this->seedCashSessions($tenant, $backofficeUsers, $windowStart, $windowEnd);
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
            'recipient_id' => fn () => $users->where('id', '!=', $users->random()->id)->random()->id,
        ]);

        $this->spreadTimestamps(Schedule::query()->where('tenant_id', $tenant->id)->latest('id')->take(36)->get(), $windowStart, $windowEnd);
        $this->spreadTimestamps(Message::query()->where('tenant_id', $tenant->id)->latest('id')->take(40)->get(), $windowStart, $windowEnd);

        $this->seedOrderRelatedData($tenant, $orders, $parts, $users, $technicians, $cashSessions, $windowStart, $windowEnd);
        $sales = $this->seedSales($tenant, $customers, $parts, $users, $cashSessions, $windowStart, $windowEnd);
        $expenses = $this->seedExpenses($tenant, $backofficeUsers, $windowStart, $windowEnd);
        $this->seedOperationalAudits($tenant, $users, $orders, $sales, $expenses, $windowStart, $windowEnd);
        $this->refreshCashSessions($cashSessions);

        Payment::factory(3)->forTenant($tenant->id)->create([
            'amount' => $tenant->plan?->value ?? 99.90,
            'created_at' => fn () => fake()->dateTimeBetween($windowStart, $windowEnd),
            'updated_at' => fn (array $attributes) => $attributes['created_at'],
        ]);
    }

    private function seedUsers(Tenant $tenant, int $tenantIndex): Collection
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

        return collect([$mainUser, $admin, $operator])->merge($technicians)->values();
    }

    private function seedCashSessions(Tenant $tenant, Collection $users, Carbon $windowStart, Carbon $windowEnd): Collection
    {
        $closedOpenedAt = Carbon::instance(fake()->dateTimeBetween($windowStart, now()->subDays(5)));
        $closedClosedAt = $closedOpenedAt->copy()->addHours(9);

        $closed = CashSession::query()->create([
            'tenant_id' => $tenant->id,
            'opened_by' => $users->random()->id,
            'closed_by' => $users->random()->id,
            'opened_at' => $closedOpenedAt,
            'closed_at' => $closedClosedAt,
            'opening_balance' => 250,
            'closing_balance' => 0,
            'expected_balance' => 0,
            'difference' => 0,
            'total_completed_sales' => 0,
            'total_order_payments' => 0,
            'total_cancelled_sales' => 0,
            'manual_entries' => 80,
            'manual_exits' => 35,
            'status' => 'closed',
            'notes' => 'Caixa demo fechado para validar relatorios.',
            'closing_notes' => 'Conferencia realizada no encerramento.',
            'created_at' => $closedOpenedAt,
            'updated_at' => $closedClosedAt,
        ]);

        $openOpenedAt = Carbon::instance(fake()->dateTimeBetween(now()->subDays(2), $windowEnd));
        $open = CashSession::query()->create([
            'tenant_id' => $tenant->id,
            'opened_by' => $users->random()->id,
            'opened_at' => $openOpenedAt,
            'opening_balance' => 180,
            'total_completed_sales' => 0,
            'total_order_payments' => 0,
            'total_cancelled_sales' => 0,
            'manual_entries' => 25,
            'manual_exits' => 10,
            'status' => 'open',
            'notes' => 'Caixa demo aberto para testes operacionais.',
            'created_at' => $openOpenedAt,
            'updated_at' => $openOpenedAt,
        ]);

        foreach ([$closed, $open] as $session) {
            CashSessionLog::query()->create([
                'tenant_id' => $tenant->id,
                'cash_session_id' => $session->id,
                'user_id' => $session->opened_by,
                'action' => 'opened',
                'data' => ['seed' => true, 'status' => $session->status],
                'created_at' => $session->opened_at,
                'updated_at' => $session->opened_at,
            ]);
        }

        CashSessionLog::query()->create([
            'tenant_id' => $tenant->id,
            'cash_session_id' => $closed->id,
            'user_id' => $closed->closed_by,
            'action' => 'closed',
            'data' => ['seed' => true],
            'created_at' => $closed->closed_at,
            'updated_at' => $closed->closed_at,
        ]);

        return collect([
            'closed' => $closed,
            'open' => $open,
        ]);
    }

    private function seedOrderRelatedData(
        Tenant $tenant,
        Collection $orders,
        Collection $parts,
        Collection $users,
        Collection $technicians,
        Collection $cashSessions,
        Carbon $windowStart,
        Carbon $windowEnd
    ): void {
        foreach ($orders->values() as $index => $order) {
            $scenario = $index % 10;
            $createdAt = Carbon::instance(fake()->dateTimeBetween($windowStart, $windowEnd->copy()->subDays(2)));
            $serviceValue = fake()->randomFloat(2, 80, 900);
            $partsValue = fake()->randomFloat(2, 0, 550);
            $serviceCost = round($serviceValue + $partsValue, 2);
            $budgetValue = $serviceCost;
            $assignedTechnician = $technicians->isNotEmpty() ? $technicians->random() : $users->random();
            $backofficeUser = $users->whereIn('roles', [User::ROLE_ROOT_APP, User::ROLE_ADMIN, User::ROLE_OPERATOR])->random();

            $payload = [
                'budget_description' => 'Diagnostico e servicos previstos para a ordem demo.',
                'budget_value' => $budgetValue,
                'parts_value' => $partsValue,
                'service_value' => $serviceValue,
                'service_cost' => $serviceCost,
                'delivery_forecast' => $createdAt->copy()->addDays(4)->format('Y-m-d'),
                'services_performed' => null,
                'delivery_date' => null,
                'warranty_days' => null,
                'warranty_expires_at' => null,
                'customer_notification_acknowledged_at' => null,
                'customer_pickup_acknowledged_at' => null,
                'customer_feedback_rating' => null,
                'customer_feedback_comment' => null,
                'customer_feedback_submitted_at' => null,
                'customer_feedback_recovery_assigned_to' => null,
                'customer_feedback_recovery_status' => null,
                'customer_feedback_recovery_notes' => null,
                'customer_feedback_recovery_updated_at' => null,
                'budget_follow_up_paused_at' => null,
                'budget_follow_up_paused_by' => null,
                'budget_follow_up_pause_reason' => null,
                'payment_follow_up_paused_at' => null,
                'payment_follow_up_paused_by' => null,
                'payment_follow_up_pause_reason' => null,
                'budget_follow_up_response_status' => null,
                'budget_follow_up_response_at' => null,
                'payment_follow_up_response_status' => null,
                'payment_follow_up_response_at' => null,
                'budget_follow_up_snoozed_until' => null,
                'payment_follow_up_snoozed_until' => null,
                'budget_follow_up_assigned_to' => null,
                'payment_follow_up_assigned_to' => null,
                'feedback' => false,
                'fiscal_document_number' => null,
                'fiscal_document_key' => null,
                'fiscal_document_url' => null,
                'fiscal_issued_at' => null,
                'fiscal_registered_by' => null,
                'fiscal_notes' => null,
                'user_id' => $assignedTechnician->id,
                'created_at' => $createdAt,
                'updated_at' => $createdAt->copy()->addDays(1),
            ];

            $history = [OrderStatus::OPEN];
            $orderPayments = [];
            $logActions = ['created'];

            switch ($scenario) {
                case 0:
                    $payload['service_status'] = OrderStatus::OPEN;
                    break;
                case 1:
                    $payload['service_status'] = OrderStatus::BUDGET_GENERATED;
                    $payload['updated_at'] = now()->subDays(6);
                    $history[] = OrderStatus::BUDGET_GENERATED;
                    $logActions[] = 'budget_generated';
                    break;
                case 2:
                    $payload['service_status'] = OrderStatus::BUDGET_GENERATED;
                    $payload['updated_at'] = now()->subDays(8);
                    $payload['budget_follow_up_paused_at'] = now()->subDay();
                    $payload['budget_follow_up_paused_by'] = $backofficeUser->id;
                    $payload['budget_follow_up_pause_reason'] = 'Aguardando retorno do cliente no seed demo.';
                    $payload['budget_follow_up_assigned_to'] = $assignedTechnician->id;
                    $payload['budget_follow_up_snoozed_until'] = now()->addDays(2);
                    $history[] = OrderStatus::BUDGET_GENERATED;
                    $logActions[] = 'budget_follow_up_paused';
                    break;
                case 3:
                    $payload['service_status'] = OrderStatus::BUDGET_APPROVED;
                    $payload['budget_follow_up_response_status'] = 'approved';
                    $payload['budget_follow_up_response_at'] = $createdAt->copy()->addDays(2);
                    $history = [OrderStatus::OPEN, OrderStatus::BUDGET_GENERATED, OrderStatus::BUDGET_APPROVED];
                    $logActions[] = 'budget_approved';
                    break;
                case 4:
                    $payload['service_status'] = OrderStatus::REPAIR_IN_PROGRESS;
                    $payload['services_performed'] = 'Reparo em andamento com substituicao parcial de componentes.';
                    $history = [OrderStatus::OPEN, OrderStatus::BUDGET_GENERATED, OrderStatus::BUDGET_APPROVED, OrderStatus::REPAIR_IN_PROGRESS];
                    $logActions[] = 'repair_started';
                    break;
                case 5:
                    $payload['service_status'] = OrderStatus::SERVICE_COMPLETED;
                    $payload['services_performed'] = 'Servico concluido e pronto para contato com o cliente.';
                    $payload['warranty_days'] = 90;
                    $history = [OrderStatus::OPEN, OrderStatus::BUDGET_GENERATED, OrderStatus::BUDGET_APPROVED, OrderStatus::REPAIR_IN_PROGRESS, OrderStatus::SERVICE_COMPLETED];
                    $orderPayments[] = ['amount' => round($serviceCost * 0.5, 2), 'paid_at' => $createdAt->copy()->addDays(3)];
                    $logActions[] = 'service_completed';
                    break;
                case 6:
                    $deliveryDate = $createdAt->copy()->addDays(5);
                    $payload['service_status'] = OrderStatus::CUSTOMER_NOTIFIED;
                    $payload['delivery_date'] = $deliveryDate;
                    $payload['services_performed'] = 'Servico concluido aguardando retirada com saldo pendente.';
                    $payload['warranty_days'] = 120;
                    $payload['warranty_expires_at'] = $deliveryDate->copy()->addDays(120);
                    $history = [OrderStatus::OPEN, OrderStatus::BUDGET_GENERATED, OrderStatus::BUDGET_APPROVED, OrderStatus::REPAIR_IN_PROGRESS, OrderStatus::SERVICE_COMPLETED, OrderStatus::CUSTOMER_NOTIFIED];
                    $orderPayments[] = ['amount' => round($serviceCost * 0.35, 2), 'paid_at' => $createdAt->copy()->addDays(4)];
                    $payload['payment_follow_up_assigned_to'] = $backofficeUser->id;
                    $logActions[] = 'customer_notified';
                    $logActions[] = 'payment_reminder_sent';
                    break;
                case 7:
                    $deliveryDate = $createdAt->copy()->addDays(6);
                    $payload['service_status'] = OrderStatus::DELIVERED;
                    $payload['delivery_date'] = $deliveryDate;
                    $payload['services_performed'] = 'Servico finalizado, entregue e avaliado positivamente.';
                    $payload['warranty_days'] = 180;
                    $payload['warranty_expires_at'] = $deliveryDate->copy()->addDays(180);
                    $payload['customer_notification_acknowledged_at'] = $deliveryDate->copy()->subHours(6);
                    $payload['customer_pickup_acknowledged_at'] = $deliveryDate;
                    $payload['customer_feedback_rating'] = 5;
                    $payload['customer_feedback_comment'] = 'Atendimento rapido e transparente.';
                    $payload['customer_feedback_submitted_at'] = $deliveryDate->copy()->addDay();
                    $payload['feedback'] = true;
                    $payload['fiscal_document_number'] = 'NF-'.$order->order_number;
                    $payload['fiscal_document_key'] = strtoupper(Str::random(32));
                    $payload['fiscal_document_url'] = 'https://exemplo.local/fiscal/'.$order->order_number;
                    $payload['fiscal_issued_at'] = $deliveryDate;
                    $payload['fiscal_registered_by'] = $backofficeUser->id;
                    $history = [OrderStatus::OPEN, OrderStatus::BUDGET_GENERATED, OrderStatus::BUDGET_APPROVED, OrderStatus::REPAIR_IN_PROGRESS, OrderStatus::SERVICE_COMPLETED, OrderStatus::CUSTOMER_NOTIFIED, OrderStatus::DELIVERED];
                    $orderPayments[] = ['amount' => $serviceCost, 'paid_at' => $deliveryDate];
                    $logActions[] = 'delivered';
                    $logActions[] = 'customer_feedback_submitted';
                    break;
                case 8:
                    $deliveryDate = $createdAt->copy()->addDays(7);
                    $payload['service_status'] = OrderStatus::DELIVERED;
                    $payload['delivery_date'] = $deliveryDate;
                    $payload['services_performed'] = 'Servico entregue, mas cliente reportou experiencia abaixo do esperado.';
                    $payload['warranty_days'] = 90;
                    $payload['warranty_expires_at'] = $deliveryDate->copy()->addDays(90);
                    $payload['customer_notification_acknowledged_at'] = $deliveryDate->copy()->subHours(8);
                    $payload['customer_pickup_acknowledged_at'] = $deliveryDate;
                    $payload['customer_feedback_rating'] = 2;
                    $payload['customer_feedback_comment'] = 'Demorou mais que o esperado para ficar pronto.';
                    $payload['customer_feedback_submitted_at'] = $deliveryDate->copy()->addDay();
                    $payload['customer_feedback_recovery_assigned_to'] = $backofficeUser->id;
                    $payload['customer_feedback_recovery_status'] = 'in_progress';
                    $payload['customer_feedback_recovery_notes'] = 'Contato de recuperacao iniciado pela equipe.';
                    $payload['customer_feedback_recovery_updated_at'] = $deliveryDate->copy()->addDays(2);
                    $payload['feedback'] = true;
                    $history = [OrderStatus::OPEN, OrderStatus::BUDGET_GENERATED, OrderStatus::BUDGET_APPROVED, OrderStatus::REPAIR_IN_PROGRESS, OrderStatus::SERVICE_COMPLETED, OrderStatus::CUSTOMER_NOTIFIED, OrderStatus::DELIVERED];
                    $orderPayments[] = ['amount' => $serviceCost, 'paid_at' => $deliveryDate];
                    $logActions[] = 'delivered';
                    $logActions[] = 'customer_feedback_submitted';
                    break;
                default:
                    $payload['service_status'] = OrderStatus::BUDGET_REJECTED;
                    $payload['budget_follow_up_response_status'] = 'rejected';
                    $payload['budget_follow_up_response_at'] = $createdAt->copy()->addDays(2);
                    $history = [OrderStatus::OPEN, OrderStatus::BUDGET_GENERATED, OrderStatus::BUDGET_REJECTED];
                    $logActions[] = 'budget_rejected';
                    break;
            }

            $order->forceFill($payload)->saveQuietly();

            $this->seedOrderParts($tenant, $order, $parts, $users, Carbon::parse($order->created_at));
            $this->seedOrderHistory($order, $history, $users, Carbon::parse($order->created_at));
            $this->seedOrderPayments($order, collect($orderPayments), $cashSessions);
            $this->seedOrderLogs($order, $logActions, $users);

            Image::factory(random_int(0, 2))->forTenant($tenant->id)->create([
                'order_id' => $order->id,
                'created_at' => fn () => Carbon::parse($order->created_at)->copy()->addHours(random_int(1, 48)),
                'updated_at' => fn (array $attributes) => $attributes['created_at'],
            ]);
        }

        $this->markWarrantyReturnScenario($orders);
    }

    private function seedOrderParts(Tenant $tenant, Order $order, Collection $parts, Collection $users, Carbon $createdAt): void
    {
        $selectedParts = $parts->random(random_int(1, 3));
        $partsForOrder = $selectedParts instanceof Part ? collect([$selectedParts]) : $selectedParts;

        foreach ($partsForOrder as $part) {
            $quantity = random_int(1, 2);
            $partCreatedAt = $createdAt->copy()->addHours(random_int(1, 24));

            DB::table('order_parts')->insert([
                'order_id' => $order->id,
                'part_id' => $part->id,
                'quantity' => $quantity,
                'created_at' => $partCreatedAt,
                'updated_at' => $partCreatedAt,
            ]);

            PartMovement::factory()->forTenant($tenant->id)->create([
                'part_id' => $part->id,
                'order_id' => $order->id,
                'user_id' => $users->random()->id,
                'movement_type' => 'saida',
                'quantity' => $quantity,
                'reason' => 'Uso em ordem #'.$order->order_number,
                'created_at' => $partCreatedAt,
                'updated_at' => $partCreatedAt,
            ]);
        }
    }

    private function seedOrderHistory(Order $order, array $statuses, Collection $users, Carbon $createdAt): void
    {
        foreach (array_values($statuses) as $index => $status) {
            $historyAt = $createdAt->copy()->addHours($index * 8);

            OrderStatusHistory::query()->create([
                'order_id' => $order->id,
                'status' => $status,
                'note' => OrderStatus::label($status),
                'changed_by' => $users->random()->id,
                'created_at' => $historyAt,
                'updated_at' => $historyAt,
            ]);
        }
    }

    private function seedOrderPayments(Order $order, Collection $payments, Collection $cashSessions): void
    {
        foreach ($payments as $payment) {
            $paidAt = Carbon::parse($payment['paid_at']);
            $cashSession = $paidAt->lte(optional($cashSessions->get('closed'))->closed_at ?? now()->subYears(10))
                ? $cashSessions->get('closed')
                : $cashSessions->get('open');

            OrderPayment::query()->create([
                'order_id' => $order->id,
                'cash_session_id' => $cashSession?->id,
                'amount' => $payment['amount'],
                'payment_method' => collect(['pix', 'cartao', 'dinheiro'])->random(),
                'paid_at' => $paidAt,
                'notes' => 'Pagamento demo da ordem #'.$order->order_number,
                'created_at' => $paidAt,
                'updated_at' => $paidAt,
            ]);
        }
    }

    private function seedOrderLogs(Order $order, array $actions, Collection $users): void
    {
        foreach ($actions as $index => $action) {
            $createdAt = Carbon::parse($order->created_at)->copy()->addHours($index * 6);

            OrderLog::query()->create([
                'order_id' => $order->id,
                'user_id' => $users->random()->id,
                'action' => $action,
                'data' => ['seed' => true, 'trigger' => 'demo'],
                'created_at' => $createdAt,
            ]);
        }
    }

    private function markWarrantyReturnScenario(Collection $orders): void
    {
        $sourceOrder = $orders->first(function (Order $order) {
            return (int) $order->service_status === OrderStatus::DELIVERED && ! empty($order->warranty_expires_at);
        });

        $returnOrder = $orders->first(function (Order $order) use ($sourceOrder) {
            return $sourceOrder
                && $order->id !== $sourceOrder->id
                && (int) $order->customer_id === (int) $sourceOrder->customer_id
                && (int) $order->equipment_id === (int) $sourceOrder->equipment_id;
        });

        if (! $sourceOrder || ! $returnOrder) {
            return;
        }

        $returnOrder->forceFill([
            'service_status' => OrderStatus::REPAIR_IN_PROGRESS,
            'is_warranty_return' => true,
            'warranty_source_order_id' => $sourceOrder->id,
            'created_at' => Carbon::parse($sourceOrder->delivery_date)->copy()->addDays(15),
            'updated_at' => Carbon::parse($sourceOrder->delivery_date)->copy()->addDays(16),
            'defect' => 'Retorno em garantia do atendimento anterior.',
        ])->saveQuietly();
    }

    private function seedSales(
        Tenant $tenant,
        Collection $customers,
        Collection $parts,
        Collection $users,
        Collection $cashSessions,
        Carbon $windowStart,
        Carbon $windowEnd
    ): Collection {
        $sales = collect();

        for ($i = 0; $i < 30; $i++) {
            $saleDate = Carbon::instance(fake()->dateTimeBetween($windowStart, $windowEnd));
            $status = collect(['completed', 'completed', 'completed', 'cancelled'])->random();
            $cashSession = $saleDate->lte(optional($cashSessions->get('closed'))->closed_at ?? now()->subYears(10))
                ? $cashSessions->get('closed')
                : $cashSessions->get('open');

            $sale = Sale::factory()->forTenant($tenant->id)->create([
                'customer_id' => $customers->random()->id,
                'cash_session_id' => $cashSession?->id,
                'status' => $status,
                'cancelled_by' => $status === 'cancelled' ? $users->random()->id : null,
                'cancel_reason' => $status === 'cancelled' ? 'Cancelamento simulado para testes.' : null,
                'cancelled_at' => $status === 'cancelled' ? $saleDate->copy()->addHour() : null,
                'total_amount' => 0,
                'paid_amount' => 0,
                'financial_status' => 'pending',
                'payment_method' => collect(['pix', 'cartao', 'dinheiro', 'transferencia', 'boleto'])->random(),
                'created_at' => $saleDate,
                'updated_at' => $saleDate,
            ]);

            $selectedParts = $parts->random(random_int(1, 4));
            $saleParts = $selectedParts instanceof Part ? collect([$selectedParts]) : $selectedParts;

            $total = 0;
            foreach ($saleParts as $part) {
                $quantity = max(1, min(random_int(1, 3), (int) ($part->quantity ?: 1)));
                $lineTotal = $quantity * (float) $part->sale_price;
                $total += $lineTotal;

                SaleItem::factory()->create([
                    'sale_id' => $sale->id,
                    'part_id' => $part->id,
                    'quantity' => $quantity,
                    'unit_price' => $part->sale_price,
                    'created_at' => $saleDate,
                    'updated_at' => $saleDate,
                ]);
            }

            $paidAmount = $status === 'cancelled'
                ? 0
                : round((float) collect([$total, $total, $total / 2])->random(), 2);

            $financialStatus = $status === 'cancelled'
                ? 'cancelled'
                : ($paidAmount < $total ? 'partial' : 'paid');

            $sale->forceFill([
                'total_amount' => $total,
                'paid_amount' => $paidAmount,
                'financial_status' => $financialStatus,
                'updated_at' => $status === 'cancelled' ? $saleDate->copy()->addHour() : $saleDate,
            ])->saveQuietly();

            SaleLog::query()->create([
                'sale_id' => $sale->id,
                'user_id' => $users->random()->id,
                'action' => $status === 'cancelled' ? 'cancelled' : 'completed',
                'data' => ['seed' => true],
                'created_at' => $sale->updated_at,
                'updated_at' => $sale->updated_at,
            ]);

            $sales->push($sale);
        }

        return $sales;
    }

    private function seedExpenses(Tenant $tenant, Collection $users, Carbon $windowStart, Carbon $windowEnd): Collection
    {
        $categories = ['Compras', 'Frete', 'Ferramentas', 'Marketing', 'Internet', 'Energia'];
        $expenses = collect();
        $counter = 1;

        for ($i = 0; $i < 18; $i++) {
            $expenseDate = Carbon::instance(fake()->dateTimeBetween($windowStart, $windowEnd));

            $expense = Expense::query()->create([
                'tenant_id' => $tenant->id,
                'expense_number' => $counter++,
                'created_by' => $users->random()->id,
                'expense_date' => $expenseDate->toDateString(),
                'description' => fake()->sentence(4),
                'category' => $categories[array_rand($categories)],
                'amount' => fake()->randomFloat(2, 25, 480),
                'notes' => 'Despesa demo para validar caixa e relatorios.',
                'created_at' => $expenseDate,
                'updated_at' => $expenseDate,
            ]);

            ExpenseLog::query()->create([
                'tenant_id' => $tenant->id,
                'expense_id' => $expense->id,
                'user_id' => $expense->created_by,
                'action' => 'created',
                'data' => ['seed' => true],
                'created_at' => $expenseDate,
                'updated_at' => $expenseDate,
            ]);

            $expenses->push($expense);
        }

        return $expenses;
    }

    private function seedOperationalAudits(
        Tenant $tenant,
        Collection $users,
        Collection $orders,
        Collection $sales,
        Collection $expenses,
        Carbon $windowStart,
        Carbon $windowEnd
    ): void {
        $entities = collect()
            ->merge($orders->take(8)->map(fn (Order $order) => ['type' => 'order', 'id' => $order->id]))
            ->merge($sales->take(4)->map(fn (Sale $sale) => ['type' => 'sale', 'id' => $sale->id]))
            ->merge($expenses->take(4)->map(fn (Expense $expense) => ['type' => 'expense', 'id' => $expense->id]));

        foreach ($entities as $entity) {
            OperationalAudit::query()->create([
                'tenant_id' => $tenant->id,
                'user_id' => $users->random()->id,
                'entity_type' => $entity['type'],
                'entity_id' => $entity['id'],
                'action' => collect(['created', 'updated', 'follow_up_sent', 'payment_registered'])->random(),
                'data' => ['seed' => true],
                'created_at' => fake()->dateTimeBetween($windowStart, $windowEnd),
            ]);
        }
    }

    private function refreshCashSessions(Collection $cashSessions): void
    {
        foreach ($cashSessions as $session) {
            if (! $session instanceof CashSession) {
                continue;
            }

            $completedSales = Sale::query()
                ->where('cash_session_id', $session->id)
                ->where('status', 'completed')
                ->sum('paid_amount');
            $cancelledSales = Sale::query()
                ->where('cash_session_id', $session->id)
                ->where('status', 'cancelled')
                ->sum('total_amount');
            $orderPayments = OrderPayment::query()
                ->where('cash_session_id', $session->id)
                ->sum('amount');

            $expectedBalance = (float) $session->opening_balance
                + (float) $session->manual_entries
                + (float) $completedSales
                + (float) $orderPayments
                - (float) $session->manual_exits;

            $closingBalance = $session->status === 'closed'
                ? round($expectedBalance + fake()->randomFloat(2, -5, 5), 2)
                : null;

            $session->forceFill([
                'total_completed_sales' => $completedSales,
                'total_cancelled_sales' => $cancelledSales,
                'total_order_payments' => $orderPayments,
                'expected_balance' => $expectedBalance,
                'closing_balance' => $closingBalance,
                'difference' => $closingBalance !== null ? round($closingBalance - $expectedBalance, 2) : null,
            ])->saveQuietly();
        }
    }

    private function spreadTimestamps(Collection $models, Carbon $start, Carbon $end): void
    {
        foreach ($models as $model) {
            $createdAt = Carbon::instance(fake()->dateTimeBetween($start, $end));
            $updatedAt = $createdAt->copy()->addDays(random_int(0, 4))->min($end);

            $model->forceFill([
                'created_at' => $createdAt,
                'updated_at' => $updatedAt,
            ])->saveQuietly();
        }
    }
}
