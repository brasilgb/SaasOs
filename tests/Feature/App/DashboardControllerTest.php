<?php

namespace Tests\Feature\App;

use App\Models\App\OrderLog;
use App\Models\App\Order;
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
