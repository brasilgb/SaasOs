<?php

namespace Tests\Feature\App;

use App\Models\App\Order;
use App\Models\Tenant;
use App\Models\User;
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
}
