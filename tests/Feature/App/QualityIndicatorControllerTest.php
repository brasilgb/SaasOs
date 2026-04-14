<?php

namespace Tests\Feature\App;

use App\Models\App\Order;
use App\Models\App\Other;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class QualityIndicatorControllerTest extends TestCase
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

    public function test_quality_indicators_page_is_accessible(): void
    {
        $response = $this->get(route('app.quality.index'));

        $response->assertOk();
    }

    public function test_quality_metrics_endpoint_returns_quality_summary(): void
    {
        Other::query()->create([
            'warranty_return_alert_threshold' => 8,
        ]);

        $sourceOrder = Order::factory()->forTenant($this->tenant->id)->create([
            'created_at' => now()->subDays(20),
            'delivery_date' => now()->subDays(12),
            'warranty_expires_at' => now()->addDays(10),
        ]);

        Order::factory()->forTenant($this->tenant->id)->create([
            'is_warranty_return' => true,
            'warranty_source_order_id' => $sourceOrder->id,
            'customer_id' => $sourceOrder->customer_id,
            'equipment_id' => $sourceOrder->equipment_id,
            'user_id' => $sourceOrder->user_id,
            'created_at' => now()->subDay(),
        ]);

        Order::factory()->forTenant($this->tenant->id)->create([
            'is_warranty_return' => false,
            'created_at' => now()->subDay(),
        ]);

        Order::factory()->forTenant($this->tenant->id)->create([
            'is_warranty_return' => true,
            'created_at' => now()->subDays(8),
        ]);

        Order::factory()->forTenant($this->tenant->id)->create([
            'is_warranty_return' => false,
            'created_at' => now()->subDays(8),
        ]);

        Order::factory()->forTenant($this->tenant->id)->create([
            'is_warranty_return' => false,
            'created_at' => now()->subDays(9),
        ]);

        $response = $this->get(route('app.quality.metrics', ['timerange' => 7]));

        $response
            ->assertOk()
            ->assertJsonPath('summary.total_orders', 2)
            ->assertJsonPath('summary.warranty_returns', 1)
            ->assertJsonPath('summary.warranty_return_threshold', 8)
            ->assertJsonPath('summary.warranty_return_rate', 50)
            ->assertJsonPath('summary.severity', 'Critico')
            ->assertJsonPath('trend.granularity', 'daily')
            ->assertJsonPath('comparison.previous_warranty_return_rate', 33.3)
            ->assertJsonPath('comparison.delta_rate', 16.7)
            ->assertJsonPath('comparison.direction', 'piorou');
    }
}
