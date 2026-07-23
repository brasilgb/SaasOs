<?php

namespace Tests\Feature\Admin;

use App\Models\App\Order;
use App\Models\Tenant;
use App\Models\User;
use App\Support\OrderStatus;
use Illuminate\Auth\Events\Login;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ReportControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $root;

    protected function setUp(): void
    {
        parent::setUp();

        $this->root = User::factory()->create([
            'tenant_id' => null,
            'user_number' => null,
            'roles' => User::ROLE_ROOT_APP,
        ]);
    }

    public function test_root_can_view_tenant_usage_report(): void
    {
        $tenant = Tenant::factory()->create(['company' => 'Oficina Teste']);
        User::factory()->forTenant($tenant->id)->create(['last_login_at' => now()->subDay()]);
        Order::factory()->forTenant($tenant->id)->create([
            'service_status' => OrderStatus::DELIVERED,
            'created_at' => now()->subDays(2),
        ]);
        Order::factory()->forTenant($tenant->id)->create([
            'service_status' => OrderStatus::OPEN,
            'created_at' => now()->subDays(40),
        ]);

        $this->actingAs($this->root)
            ->get(route('admin.reports.index', [
                'start_date' => now()->subDays(7)->toDateString(),
                'end_date' => now()->toDateString(),
                'search' => 'Oficina Teste',
            ]))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('admin/reports/index')
                ->where('summary.tenants', 1)
                ->where('summary.users', 1)
                ->where('summary.active_users', 1)
                ->where('summary.orders', 1)
                ->where('summary.delivered_orders', 1)
                ->where('summary.open_orders', 1)
                ->has('tenants', 1)
                ->where('tenants.0.company', 'Oficina Teste')
                ->where('tenants.0.period_orders_count', 1)
                ->where('tenants.0.orders_count', 2));
    }

    public function test_login_records_last_access(): void
    {
        $user = User::factory()->create(['last_login_at' => null]);

        event(new Login('web', $user, false));

        $this->assertNotNull($user->fresh()->last_login_at);
    }

    public function test_prospect_routes_are_no_longer_available(): void
    {
        $this->actingAs($this->root)
            ->get('/admin/prospects')
            ->assertNotFound();
    }
}
