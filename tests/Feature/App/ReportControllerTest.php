<?php

namespace Tests\Feature\App;

use App\Models\App\FiscalDocument;
use App\Models\App\FiscalSetting;
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

    public function test_fiscal_report_exposes_documents_by_domain(): void
    {
        FiscalSetting::create([
            'tenant_id' => $this->tenant->id,
            'enabled' => true,
            'nfe_enabled' => true,
            'nfse_enabled' => true,
        ]);

        $order = Order::factory()->forTenant($this->tenant->id)->create();

        FiscalDocument::create([
            'tenant_id' => $this->tenant->id,
            'documentable_type' => Order::class,
            'documentable_id' => $order->id,
            'type' => 'nfse',
            'provider' => 'manual',
            'number' => 'NFSE-001',
            'status' => 'registered',
            'issued_at' => now()->subDay(),
            'registered_by' => $this->user->id,
            'created_at' => now()->subDay(),
            'updated_at' => now()->subDay(),
        ]);

        FiscalDocument::create([
            'tenant_id' => $this->tenant->id,
            'documentable_type' => Order::class,
            'documentable_id' => $order->id,
            'type' => 'nfe',
            'provider' => 'legacy_integration',
            'provider_reference' => 'nfe-1-1',
            'status' => 'error',
            'created_at' => now()->subDay(),
            'updated_at' => now()->subDay(),
        ]);

        $response = $this->post(route('app.reports.store'), [
            'type' => 'fiscal',
            'from' => now()->subDays(7)->toDateString(),
            'to' => now()->toDateString(),
        ]);

        $response
            ->assertOk()
            ->assertViewHas('page.props.reportData', fn ($documents) => count($documents) === 2)
            ->assertViewHas('page.props.reportMeta.documents_count', 2)
            ->assertViewHas('page.props.reportMeta.manual_count', 1)
            ->assertViewHas('page.props.reportMeta.integration_count', 1)
            ->assertViewHas('page.props.reportMeta.nfe_count', 1)
            ->assertViewHas('page.props.reportMeta.nfse_count', 1)
            ->assertViewHas('page.props.reportMeta.error_count', 1);
    }
}
