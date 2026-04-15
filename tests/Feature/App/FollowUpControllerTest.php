<?php

namespace Tests\Feature\App;

use App\Models\App\Customer;
use App\Models\App\Equipment;
use App\Models\App\Order;
use App\Models\App\OrderPayment;
use App\Models\App\OrderLog;
use App\Models\Tenant;
use App\Models\User;
use App\Support\OrderStatus;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FollowUpControllerTest extends TestCase
{
    use RefreshDatabase;

    private Tenant $tenant;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();

        $this->tenant = Tenant::factory()->create(['name' => 'Test Tenant']);
        $this->user = User::factory()->forTenant($this->tenant->id)->create();

        $this->withSession(['tenant_id' => $this->tenant->id])
            ->actingAs($this->user);
    }

    public function test_it_lists_budget_and_payment_follow_ups(): void
    {
        $customer = Customer::factory()->forTenant($this->tenant->id)->create();
        $equipment = Equipment::factory()->forTenant($this->tenant->id)->create();

        $budgetOrder = Order::factory()->forTenant($this->tenant->id)->create([
            'customer_id' => $customer->id,
            'equipment_id' => $equipment->id,
            'user_id' => $this->user->id,
            'service_status' => OrderStatus::BUDGET_GENERATED,
            'updated_at' => now()->subDays(3),
        ]);

        $paymentOrder = Order::factory()->forTenant($this->tenant->id)->create([
            'customer_id' => $customer->id,
            'equipment_id' => $equipment->id,
            'user_id' => $this->user->id,
            'service_status' => OrderStatus::DELIVERED,
            'service_cost' => 300,
            'delivery_date' => now()->subDays(4),
            'updated_at' => now()->subDays(4),
        ]);

        OrderPayment::create([
            'order_id' => $paymentOrder->id,
            'amount' => 100,
            'payment_method' => 'pix',
            'paid_at' => now()->subDays(3),
        ]);

        $response = $this->get(route('app.follow-ups.index'));

        $response
            ->assertOk()
            ->assertViewHas('page.props.summary.budget_follow_ups', 1)
            ->assertViewHas('page.props.summary.payment_follow_ups', 1)
            ->assertViewHas('page.props.summary.today_tasks', 2)
            ->assertViewHas('page.props.dailyAgenda', function ($agenda) use ($budgetOrder, $paymentOrder) {
                $ids = collect($agenda)->pluck('id');

                return $ids->contains($budgetOrder->id) && $ids->contains($paymentOrder->id);
            })
            ->assertViewHas('page.props.budgetOrders', function ($orders) use ($budgetOrder) {
                return collect($orders['data'] ?? [])->pluck('id')->contains($budgetOrder->id);
            })
            ->assertViewHas('page.props.paymentOrders', function ($orders) use ($paymentOrder) {
                return collect($orders['data'] ?? [])->pluck('id')->contains($paymentOrder->id);
            });
    }

    public function test_it_filters_follow_ups_by_type(): void
    {
        $response = $this->get(route('app.follow-ups.index', ['type' => 'budget']));

        $response
            ->assertOk()
            ->assertViewHas('page.props.filters.type', 'budget');
    }

    public function test_it_filters_follow_ups_by_response_status(): void
    {
        $customer = Customer::factory()->forTenant($this->tenant->id)->create();
        $equipment = Equipment::factory()->forTenant($this->tenant->id)->create();

        $matchedOrder = Order::factory()->forTenant($this->tenant->id)->create([
            'customer_id' => $customer->id,
            'equipment_id' => $equipment->id,
            'user_id' => $this->user->id,
            'service_status' => OrderStatus::BUDGET_GENERATED,
            'updated_at' => now()->subDays(6),
            'budget_follow_up_response_status' => 'waiting_piece',
            'budget_follow_up_response_at' => now()->subHour(),
        ]);

        Order::factory()->forTenant($this->tenant->id)->create([
            'customer_id' => $customer->id,
            'equipment_id' => $equipment->id,
            'user_id' => $this->user->id,
            'service_status' => OrderStatus::BUDGET_GENERATED,
            'updated_at' => now()->subDays(6),
        ]);

        $response = $this->get(route('app.follow-ups.index', [
            'type' => 'budget',
            'response_status' => 'waiting_piece',
        ]));

        $response
            ->assertOk()
            ->assertViewHas('page.props.filters.response_status', 'waiting_piece')
            ->assertViewHas('page.props.budgetOrders', function ($orders) use ($matchedOrder) {
                $ids = collect($orders['data'] ?? [])->pluck('id');

                return $ids->contains($matchedOrder->id) && $ids->count() === 1;
            });
    }

    public function test_it_renders_follow_up_performance_page(): void
    {
        $response = $this->get(route('app.follow-ups.performance'));

        $response
            ->assertOk()
            ->assertViewHas('page.component', 'app/follow-ups/performance')
            ->assertViewHas('page.props.summary.recovery')
            ->assertViewHas('page.props.summary.commercial')
            ->assertViewHas('page.props.summary.comparison')
            ->assertViewHas('page.props.summary.targets')
            ->assertViewHas('page.props.trends.budget');
    }

    public function test_it_renders_follow_up_tasks_page(): void
    {
        $response = $this->get(route('app.follow-ups.tasks'));

        $response
            ->assertOk()
            ->assertViewHas('page.component', 'app/follow-ups/tasks')
            ->assertViewHas('page.props.summary.today_tasks')
            ->assertViewHas('page.props.dailyAgenda');
    }

    public function test_it_filters_follow_up_tasks_by_type_and_assignee(): void
    {
        $customer = Customer::factory()->forTenant($this->tenant->id)->create();
        $equipment = Equipment::factory()->forTenant($this->tenant->id)->create();
        $assignee = User::factory()->forTenant($this->tenant->id)->create([
            'roles' => User::ROLE_OPERATOR,
            'status' => 1,
        ]);

        $matchedOrder = Order::factory()->forTenant($this->tenant->id)->create([
            'customer_id' => $customer->id,
            'equipment_id' => $equipment->id,
            'user_id' => $this->user->id,
            'service_status' => OrderStatus::BUDGET_GENERATED,
            'updated_at' => now()->subDays(6),
            'budget_follow_up_assigned_to' => $assignee->id,
        ]);

        Order::factory()->forTenant($this->tenant->id)->create([
            'customer_id' => $customer->id,
            'equipment_id' => $equipment->id,
            'user_id' => $this->user->id,
            'service_status' => OrderStatus::BUDGET_GENERATED,
            'updated_at' => now()->subDays(6),
        ]);

        $response = $this->get(route('app.follow-ups.tasks', [
            'type' => 'budget',
            'assigned_to' => (string) $assignee->id,
        ]));

        $response
            ->assertOk()
            ->assertViewHas('page.props.filters.type', 'budget')
            ->assertViewHas('page.props.filters.assigned_to', (string) $assignee->id)
            ->assertViewHas('page.props.dailyAgenda', function ($agenda) use ($matchedOrder) {
                $ids = collect($agenda)->pluck('id');

                return $ids->contains($matchedOrder->id) && $ids->count() === 1;
            });
    }

    public function test_it_defaults_tasks_filter_to_current_user_for_common_user(): void
    {
        $operator = User::factory()->forTenant($this->tenant->id)->create([
            'roles' => User::ROLE_OPERATOR,
            'status' => 1,
        ]);

        $this->actingAs($operator)->withSession(['tenant_id' => $this->tenant->id]);

        $response = $this->get(route('app.follow-ups.tasks'));

        $response
            ->assertOk()
            ->assertViewHas('page.props.filters.assigned_to', (string) $operator->id);
    }

    public function test_it_exposes_recovery_and_technician_summary(): void
    {
        $customer = Customer::factory()->forTenant($this->tenant->id)->create([
            'email' => 'cliente@example.com',
        ]);
        $equipment = Equipment::factory()->forTenant($this->tenant->id)->create();

        $budgetOrder = Order::factory()->forTenant($this->tenant->id)->create([
            'customer_id' => $customer->id,
            'equipment_id' => $equipment->id,
            'user_id' => $this->user->id,
            'service_status' => OrderStatus::BUDGET_APPROVED,
            'updated_at' => now()->subDays(5),
        ]);

        $paymentOrder = Order::factory()->forTenant($this->tenant->id)->create([
            'customer_id' => $customer->id,
            'equipment_id' => $equipment->id,
            'user_id' => $this->user->id,
            'service_status' => OrderStatus::DELIVERED,
            'service_cost' => 300,
            'delivery_date' => now()->subDays(4),
            'updated_at' => now()->subDays(4),
        ]);

        OrderLog::query()->create([
            'order_id' => $budgetOrder->id,
            'user_id' => $this->user->id,
            'action' => 'budget_follow_up_sent',
            'data' => ['trigger' => 'manual'],
            'created_at' => now()->subDay(),
        ]);

        OrderLog::query()->create([
            'order_id' => $paymentOrder->id,
            'user_id' => $this->user->id,
            'action' => 'payment_reminder_sent',
            'data' => ['trigger' => 'automatic'],
            'created_at' => now()->subDay(),
        ]);

        OrderPayment::create([
            'order_id' => $paymentOrder->id,
            'amount' => 300,
            'payment_method' => 'pix',
            'paid_at' => now(),
        ]);

        Order::factory()->forTenant($this->tenant->id)->create([
            'customer_id' => $customer->id,
            'equipment_id' => $equipment->id,
            'user_id' => $this->user->id,
            'service_status' => OrderStatus::BUDGET_GENERATED,
            'updated_at' => now()->subDays(6),
        ]);

        $response = $this->get(route('app.follow-ups.index'));

        $response
            ->assertOk()
            ->assertViewHas('page.props.summary.recovery.budget.rate', 100.0)
            ->assertViewHas('page.props.summary.recovery.payment.rate', 100.0)
            ->assertViewHas('page.props.summary.metrics_period.from')
            ->assertViewHas('page.props.trends.budget.data')
            ->assertViewHas('page.props.summary.trigger_performance.budget.manual.rate', 100.0)
            ->assertViewHas('page.props.summary.trigger_performance.payment.automatic.rate', 100.0)
            ->assertViewHas('page.props.summary.trigger_performance.budget.automatic.rate', 0.0)
            ->assertViewHas('page.props.summary.commercial.budget.rate', 100.0)
            ->assertViewHas('page.props.summary.commercial.payment.rate', 100.0)
            ->assertViewHas('page.props.summary.commercial.technicians', function ($technicians) {
                return collect($technicians)->contains(function ($item) {
                    return ($item['name'] ?? null) === $this->user->name
                        && ($item['budget_rate'] ?? null) === 100.0
                        && ($item['payment_rate'] ?? null) === 100.0;
                });
            })
            ->assertViewHas('page.props.technicianSummary', function ($summary) {
                return collect($summary)->contains(function ($item) {
                    return ($item['name'] ?? null) === $this->user->name
                        && ($item['total'] ?? null) >= 0;
                });
            })
            ->assertViewHas('page.props.technicianRanking', function ($ranking) {
                return collect($ranking)->contains(function ($item) {
                    return ($item['name'] ?? null) === $this->user->name
                        && ($item['rate'] ?? null) === 100.0;
                });
            });
    }

    public function test_it_pauses_budget_automation_for_order(): void
    {
        $customer = Customer::factory()->forTenant($this->tenant->id)->create();
        $equipment = Equipment::factory()->forTenant($this->tenant->id)->create();

        $order = Order::factory()->forTenant($this->tenant->id)->create([
            'customer_id' => $customer->id,
            'equipment_id' => $equipment->id,
            'user_id' => $this->user->id,
            'service_status' => OrderStatus::BUDGET_GENERATED,
        ]);

        $response = $this->post(route('app.follow-ups.pause', $order), [
            'scope' => 'budget',
            'reason' => 'Cliente pediu pausa até segunda-feira.',
        ]);

        $response->assertRedirect();

        $this->assertDatabaseHas('orders', [
            'id' => $order->id,
            'budget_follow_up_paused_by' => $this->user->id,
            'budget_follow_up_pause_reason' => 'Cliente pediu pausa até segunda-feira.',
        ]);

        $this->assertDatabaseHas('order_logs', [
            'order_id' => $order->id,
            'user_id' => $this->user->id,
            'action' => 'budget_follow_up_paused',
        ]);
    }

    public function test_it_resumes_payment_automation_for_order(): void
    {
        $customer = Customer::factory()->forTenant($this->tenant->id)->create();
        $equipment = Equipment::factory()->forTenant($this->tenant->id)->create();

        $order = Order::factory()->forTenant($this->tenant->id)->create([
            'customer_id' => $customer->id,
            'equipment_id' => $equipment->id,
            'user_id' => $this->user->id,
            'service_status' => OrderStatus::DELIVERED,
            'payment_follow_up_paused_at' => now(),
            'payment_follow_up_paused_by' => $this->user->id,
            'payment_follow_up_pause_reason' => 'Aguardando confirmação do financeiro.',
        ]);

        $response = $this->post(route('app.follow-ups.resume', $order), [
            'scope' => 'payment',
        ]);

        $response->assertRedirect();

        $order->refresh();

        $this->assertNull($order->payment_follow_up_paused_at);
        $this->assertNull($order->payment_follow_up_paused_by);
        $this->assertNull($order->payment_follow_up_pause_reason);

        $log = OrderLog::query()
            ->where('order_id', $order->id)
            ->where('action', 'payment_follow_up_resumed')
            ->first();

        $this->assertNotNull($log);
        $this->assertSame('payment', $log->data['scope'] ?? null);
    }

    public function test_it_registers_customer_response_for_budget_follow_up(): void
    {
        $customer = Customer::factory()->forTenant($this->tenant->id)->create();
        $equipment = Equipment::factory()->forTenant($this->tenant->id)->create();

        $order = Order::factory()->forTenant($this->tenant->id)->create([
            'customer_id' => $customer->id,
            'equipment_id' => $equipment->id,
            'user_id' => $this->user->id,
            'service_status' => OrderStatus::BUDGET_GENERATED,
        ]);

        $response = $this->post(route('app.follow-ups.respond', $order), [
            'scope' => 'budget',
            'status' => 'waiting_piece',
        ]);

        $response->assertRedirect();

        $this->assertDatabaseHas('orders', [
            'id' => $order->id,
            'budget_follow_up_response_status' => 'waiting_piece',
            'budget_follow_up_pause_reason' => 'Aguardando peça',
            'budget_follow_up_paused_by' => $this->user->id,
        ]);

        $this->assertDatabaseHas('order_logs', [
            'order_id' => $order->id,
            'user_id' => $this->user->id,
            'action' => 'budget_follow_up_response_marked',
        ]);
    }

    public function test_it_marks_follow_up_task_as_completed(): void
    {
        $customer = Customer::factory()->forTenant($this->tenant->id)->create();
        $equipment = Equipment::factory()->forTenant($this->tenant->id)->create();

        $order = Order::factory()->forTenant($this->tenant->id)->create([
            'customer_id' => $customer->id,
            'equipment_id' => $equipment->id,
            'user_id' => $this->user->id,
            'service_status' => OrderStatus::BUDGET_GENERATED,
        ]);

        $response = $this->post(route('app.follow-ups.complete-task', $order), [
            'scope' => 'budget',
            'reason' => 'Contato feito e equipe alinhada para próxima etapa.',
        ]);

        $response->assertRedirect();

        $this->assertDatabaseHas('order_logs', [
            'order_id' => $order->id,
            'user_id' => $this->user->id,
            'action' => 'budget_follow_up_task_completed',
        ]);
    }

    public function test_it_assigns_follow_up_task_to_responsible_user(): void
    {
        $customer = Customer::factory()->forTenant($this->tenant->id)->create();
        $equipment = Equipment::factory()->forTenant($this->tenant->id)->create();
        $assignee = User::factory()->forTenant($this->tenant->id)->create([
            'roles' => User::ROLE_OPERATOR,
            'status' => 1,
        ]);

        $order = Order::factory()->forTenant($this->tenant->id)->create([
            'customer_id' => $customer->id,
            'equipment_id' => $equipment->id,
            'user_id' => $this->user->id,
            'service_status' => OrderStatus::BUDGET_GENERATED,
        ]);

        $response = $this->post(route('app.follow-ups.assign-task', $order), [
            'scope' => 'budget',
            'user_id' => $assignee->id,
        ]);

        $response->assertRedirect();

        $this->assertDatabaseHas('orders', [
            'id' => $order->id,
            'budget_follow_up_assigned_to' => $assignee->id,
        ]);

        $this->assertDatabaseHas('order_logs', [
            'order_id' => $order->id,
            'user_id' => $this->user->id,
            'action' => 'budget_follow_up_task_assigned',
        ]);
    }

    public function test_it_snoozes_follow_up_task_and_removes_it_from_daily_agenda(): void
    {
        $customer = Customer::factory()->forTenant($this->tenant->id)->create();
        $equipment = Equipment::factory()->forTenant($this->tenant->id)->create();

        $order = Order::factory()->forTenant($this->tenant->id)->create([
            'customer_id' => $customer->id,
            'equipment_id' => $equipment->id,
            'user_id' => $this->user->id,
            'service_status' => OrderStatus::DELIVERED,
            'service_cost' => 300,
            'delivery_date' => now()->subDays(6),
            'updated_at' => now()->subDays(6),
        ]);

        OrderPayment::create([
            'order_id' => $order->id,
            'amount' => 100,
            'payment_method' => 'pix',
            'paid_at' => now()->subDays(5),
        ]);

        $response = $this->post(route('app.follow-ups.snooze-task', $order), [
            'scope' => 'payment',
            'days' => 3,
        ]);

        $response->assertRedirect();

        $order->refresh();

        $this->assertNotNull($order->payment_follow_up_snoozed_until);
        $this->assertTrue($order->payment_follow_up_snoozed_until->isFuture());

        $this->assertDatabaseHas('order_logs', [
            'order_id' => $order->id,
            'user_id' => $this->user->id,
            'action' => 'payment_follow_up_task_snoozed',
        ]);

        $agendaResponse = $this->get(route('app.follow-ups.index'));

        $agendaResponse
            ->assertOk()
            ->assertViewHas('page.props.dailyAgenda', function ($agenda) use ($order) {
                return ! collect($agenda)->pluck('id')->contains($order->id);
            });
    }
}
