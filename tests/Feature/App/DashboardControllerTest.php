<?php

namespace Tests\Feature\App;

use App\Models\App\OrderLog;
use App\Models\App\Order;
use App\Models\App\Sale;
use App\Models\App\Schedule;
use App\Models\Tenant;
use App\Models\User;
use App\Support\OrderStatus;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DashboardControllerTest extends TestCase
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

    public function test_dashboard_index_exposes_warranty_return_summary(): void
    {
        $warrantyReturnOrder = Order::factory()->forTenant($this->tenant->id)->create([
            'is_warranty_return' => true,
        ]);

        Order::factory()->forTenant($this->tenant->id)->create([
            'is_warranty_return' => false,
        ]);

        $response = $this->get(route('app.dashboard'));

        $response
            ->assertOk()
            ->assertViewHas('page.props.acount.numorde_warranty_return', 1)
            ->assertViewHas('page.props.warrantyIndicator.warranty_return_threshold', 10.0)
            ->assertViewHas('page.props.orders.garantia', function (array $orders) use ($warrantyReturnOrder) {
                return collect($orders)->pluck('id')->contains($warrantyReturnOrder->id);
            });
    }

    public function test_dashboard_index_exposes_operation_status_items_with_searchable_identifiers(): void
    {
        $schedule = Schedule::factory()->forTenant($this->tenant->id)->create([
            'status' => 1,
        ]);
        $budgetOrder = Order::factory()->forTenant($this->tenant->id)->create([
            'service_status' => OrderStatus::BUDGET_GENERATED,
        ]);
        $deliveredOrder = Order::factory()->forTenant($this->tenant->id)->create([
            'service_status' => OrderStatus::DELIVERED,
            'delivery_date' => now()->subDays(8),
            'customer_feedback_submitted_at' => null,
        ]);

        $response = $this->get(route('app.dashboard'));

        $response
            ->assertOk()
            ->assertViewHas('page.props.feedbackDelay', 7)
            ->assertViewHas('page.props.orders.agendados', function ($items) use ($schedule) {
                return collect($items)->contains(fn ($item) => (int) $item['id'] === $schedule->id
                    && (int) $item['schedules_number'] === (int) $schedule->schedules_number);
            })
            ->assertViewHas('page.props.orders.gerados', function ($items) use ($budgetOrder) {
                return collect($items)->contains(fn ($item) => (int) $item['id'] === $budgetOrder->id
                    && (int) $item['order_number'] === (int) $budgetOrder->order_number);
            })
            ->assertViewHas('page.props.orders.feedback', function ($items) use ($deliveredOrder) {
                return collect($items)->contains(fn ($item) => (int) $item['id'] === $deliveredOrder->id
                    && (int) $item['order_number'] === (int) $deliveredOrder->order_number);
            });
    }

    public function test_schedules_index_filters_by_schedule_number(): void
    {
        $matchingSchedule = Schedule::factory()->forTenant($this->tenant->id)->create([
            'schedules_number' => 1234,
            'service' => 'Manutencao preventiva',
        ]);
        Schedule::factory()->forTenant($this->tenant->id)->create([
            'schedules_number' => 4321,
            'service' => 'Instalacao',
        ]);

        $response = $this->get(route('app.schedules.index', ['search' => $matchingSchedule->schedules_number]));

        $response
            ->assertOk()
            ->assertViewHas('page.props.schedules.data', function ($items) use ($matchingSchedule) {
                return collect($items)->pluck('id')->all() === [$matchingSchedule->id];
            });
    }

    public function test_dashboard_index_exposes_commercial_performance_alert(): void
    {
        $budgetOrder = Order::factory()->forTenant($this->tenant->id)->create([
            'service_status' => OrderStatus::BUDGET_GENERATED,
        ]);

        $paymentOrder = Order::factory()->forTenant($this->tenant->id)->create([
            'service_status' => OrderStatus::DELIVERED,
            'service_cost' => 300,
        ]);

        OrderLog::query()->create([
            'order_id' => $budgetOrder->id,
            'action' => 'budget_follow_up_sent',
            'data' => ['trigger' => 'manual'],
            'created_at' => now()->subDay(),
        ]);

        OrderLog::query()->create([
            'order_id' => $paymentOrder->id,
            'action' => 'payment_reminder_sent',
            'data' => ['trigger' => 'automatic'],
            'created_at' => now()->subDay(),
        ]);

        $response = $this->get(route('app.dashboard'));

        $response
            ->assertOk()
            ->assertViewHas('page.props.performanceAlert.hasAlert', true)
            ->assertViewHas('page.props.performanceAlert.budgetBelowTarget', true)
            ->assertViewHas('page.props.performanceAlert.paymentBelowTarget', true);
    }

    public function test_dashboard_index_exposes_personal_task_indicator(): void
    {
        Order::factory()->forTenant($this->tenant->id)->create([
            'budget_follow_up_assigned_to' => $this->user->id,
            'service_status' => OrderStatus::BUDGET_GENERATED,
            'updated_at' => now()->subDays(12),
        ]);

        Order::factory()->forTenant($this->tenant->id)->create([
            'service_status' => OrderStatus::BUDGET_GENERATED,
            'updated_at' => now()->subDays(12),
        ]);

        $response = $this->get(route('app.dashboard'));

        $response
            ->assertOk()
            ->assertViewHas('page.props.taskIndicator.hasTasks', true)
            ->assertViewHas('page.props.taskIndicator.total', 1)
            ->assertViewHas('page.props.taskIndicator.critical', 1)
            ->assertViewHas('page.props.taskIndicator.unassigned', 1);
    }

    public function test_metrics_system_returns_warranty_return_count_for_period(): void
    {
        Order::factory()->forTenant($this->tenant->id)->create([
            'is_warranty_return' => true,
            'created_at' => now()->subDay(),
        ]);

        Order::factory()->forTenant($this->tenant->id)->create([
            'is_warranty_return' => false,
            'created_at' => now()->subDay(),
        ]);

        Order::factory()->forTenant($this->tenant->id)->create([
            'is_warranty_return' => true,
            'created_at' => now()->subDays(20),
        ]);

        $response = $this->get(route('app.metricsSystem', ['timerange' => 7]));

        $response
            ->assertOk()
            ->assertJsonPath('warranty_returns', 1)
            ->assertJsonPath('warranty_return_threshold', 10)
            ->assertJsonPath('warranty_return_rate', 50)
            ->assertJsonPath('warranty_return_alert', true);
    }

    public function test_metrics_system_returns_communication_follow_up_counts(): void
    {
        Order::factory()->forTenant($this->tenant->id)->create([
            'service_status' => OrderStatus::BUDGET_GENERATED,
            'created_at' => now()->subDays(3),
            'updated_at' => now()->subDays(3),
        ]);

        Order::factory()->forTenant($this->tenant->id)->create([
            'service_status' => OrderStatus::DELIVERED,
            'service_cost' => 250,
            'delivery_date' => now()->subDays(4),
            'created_at' => now()->subDays(4),
            'updated_at' => now()->subDays(4),
        ]);

        $response = $this->get(route('app.metricsSystem', ['timerange' => 7]));

        $response
            ->assertOk()
            ->assertJsonPath('budget_follow_ups', 1)
            ->assertJsonPath('pending_payment_follow_ups', 1);
    }

    public function test_metrics_system_returns_customer_feedback_summary(): void
    {
        Order::factory()->forTenant($this->tenant->id)->create([
            'service_status' => OrderStatus::DELIVERED,
            'created_at' => now()->subDay(),
            'customer_feedback_submitted_at' => now()->subHours(6),
            'customer_feedback_rating' => 3,
        ]);

        Order::factory()->forTenant($this->tenant->id)->create([
            'service_status' => OrderStatus::DELIVERED,
            'created_at' => now()->subDay(),
        ]);

        $response = $this->get(route('app.metricsSystem', ['timerange' => 7]));

        $response
            ->assertOk()
            ->assertJsonPath('feedback_responses', 1)
            ->assertJsonPath('feedback_average_rating', 3)
            ->assertJsonPath('feedback_response_rate', 50)
            ->assertJsonPath('low_feedbacks', 1)
            ->assertJsonPath('feedback_alert', true);
    }

    public function test_financial_order_kpis_include_previous_period_comparison(): void
    {
        Order::factory()->forTenant($this->tenant->id)->create([
            'service_status' => OrderStatus::DELIVERED,
            'delivery_date' => now()->subDay(),
            'service_value' => 150,
            'parts_value' => 50,
        ]);

        Order::factory()->forTenant($this->tenant->id)->create([
            'service_status' => OrderStatus::DELIVERED,
            'delivery_date' => now()->subDays(8),
            'service_value' => 75,
            'parts_value' => 25,
        ]);

        $response = $this->get(route('app.kpisFinancialOrder', ['timerange' => 7]));

        $response
            ->assertOk()
            ->assertJsonPath('kpis.comparison.range_revenue.current', 200)
            ->assertJsonPath('kpis.comparison.range_revenue.previous', 100)
            ->assertJsonPath('kpis.comparison.range_revenue.change', 100)
            ->assertJsonPath('kpis.comparison.range_revenue.percent', 100);
    }

    public function test_financial_sales_kpis_include_previous_period_comparison(): void
    {
        Sale::factory()->forTenant($this->tenant->id)->create([
            'status' => 'completed',
            'total_amount' => 300,
            'created_at' => now()->subDay(),
        ]);

        Sale::factory()->forTenant($this->tenant->id)->create([
            'status' => 'completed',
            'total_amount' => 100,
            'created_at' => now()->subDays(8),
        ]);

        $response = $this->get(route('app.kpisFinancialSales', ['timerange' => 7]));

        $response
            ->assertOk()
            ->assertJsonPath('kpis.comparison.range_revenue.current', 300)
            ->assertJsonPath('kpis.comparison.range_revenue.previous', 100)
            ->assertJsonPath('kpis.comparison.range_revenue.change', 200)
            ->assertJsonPath('kpis.comparison.range_revenue.percent', 200);
    }

    public function test_dashboard_index_exposes_customer_feedback_alert(): void
    {
        Order::factory()->forTenant($this->tenant->id)->create([
            'service_status' => OrderStatus::DELIVERED,
            'customer_feedback_submitted_at' => now()->subDays(4),
            'customer_feedback_rating' => 2,
        ]);

        $response = $this->get(route('app.dashboard'));

        $response
            ->assertOk()
            ->assertViewHas('page.props.customerFeedbackAlert.hasAlert', true)
            ->assertViewHas('page.props.customerFeedbackAlert.total', 1)
            ->assertViewHas('page.props.customerFeedbackAlert.unassigned', 1)
            ->assertViewHas('page.props.customerFeedbackAlert.pending', 1)
            ->assertViewHas('page.props.customerFeedbackAlert.overdue', 1)
            ->assertViewHas('page.props.customerFeedbackAlert.slaDays', 3);
    }
}
