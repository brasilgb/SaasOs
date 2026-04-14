<?php

namespace Tests\Feature\App;

use App\Models\App\Order;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReportControllerTest extends TestCase
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

    public function test_orders_report_exposes_warranty_return_meta(): void
    {
        Order::factory()->forTenant($this->tenant->id)->create([
            'is_warranty_return' => true,
            'created_at' => now()->subDay(),
        ]);

        Order::factory()->forTenant($this->tenant->id)->create([
            'is_warranty_return' => false,
            'created_at' => now()->subDay(),
        ]);

        $response = $this->post(route('app.reports.store'), [
            'type' => 'orders',
            'from' => now()->subDays(7)->toDateString(),
            'to' => now()->toDateString(),
        ]);

        $response
            ->assertOk()
            ->assertViewHas('page.props.reportMeta.warranty_return_threshold', 10.0)
            ->assertViewHas('page.props.reportMeta.warranty_return_rate', 50.0)
            ->assertViewHas('page.props.reportMeta.warranty_return_alert', true)
            ->assertViewHas('page.props.reportMeta.warranty_returns', 1);
    }
}
