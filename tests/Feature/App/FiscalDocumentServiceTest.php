<?php

namespace Tests\Feature\App;

use App\Models\App\Customer;
use App\Models\App\Equipment;
use App\Models\App\FiscalSetting;
use App\Models\App\Order;
use App\Models\App\Sale;
use App\Models\Tenant;
use App\Models\User;
use App\Services\FiscalDocumentService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FiscalDocumentServiceTest extends TestCase
{
    use RefreshDatabase;

    private Tenant $tenant;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();

        $this->tenant = Tenant::factory()->create();
        $this->user = User::factory()->forTenant($this->tenant->id)->create();

        $this->withSession(['tenant_id' => $this->tenant->id])
            ->actingAs($this->user);
    }

    public function test_it_registers_manual_order_nfse(): void
    {
        $customer = Customer::factory()->forTenant($this->tenant->id)->create();
        $equipment = Equipment::factory()->forTenant($this->tenant->id)->create();
        $order = Order::factory()->forTenant($this->tenant->id)->create([
            'customer_id' => $customer->id,
            'equipment_id' => $equipment->id,
        ]);

        $document = app(FiscalDocumentService::class)->registerManualOrder($order, [
            'fiscal_document_number' => 'NFSE-001',
            'fiscal_document_url' => 'https://example.test/nfse.pdf',
            'fiscal_issued_at' => '2026-05-19 10:00:00',
            'fiscal_notes' => 'Registro manual da NFS-e.',
        ], $this->user->id);

        $this->assertSame('nfse', $document->type);
        $this->assertSame('manual', $document->provider);

        $this->assertDatabaseHas('fiscal_documents', [
            'tenant_id' => $this->tenant->id,
            'documentable_type' => Order::class,
            'documentable_id' => $order->id,
            'provider' => 'manual',
            'type' => 'nfse',
            'number' => 'NFSE-001',
            'status' => 'registered',
            'pdf_url' => 'https://example.test/nfse.pdf',
            'registered_by' => $this->user->id,
        ]);

        $this->assertDatabaseHas('orders', [
            'id' => $order->id,
            'fiscal_document_number' => 'NFSE-001',
            'fiscal_document_url' => 'https://example.test/nfse.pdf',
            'fiscal_registered_by' => $this->user->id,
        ]);
    }

    public function test_it_registers_manual_sale_nfe(): void
    {
        $sale = Sale::factory()->forTenant($this->tenant->id)->create([
            'status' => 'completed',
        ]);

        $document = app(FiscalDocumentService::class)->registerManualSale($sale, [
            'fiscal_document_number' => 'NFE-001',
            'fiscal_document_url' => 'https://example.test/nfe.pdf',
            'fiscal_issued_at' => '2026-05-19 10:00:00',
            'fiscal_notes' => 'Registro manual da NF-e.',
        ], $this->user->id);

        $this->assertSame('nfe', $document->type);
        $this->assertSame('manual', $document->provider);

        $this->assertDatabaseHas('fiscal_documents', [
            'tenant_id' => $this->tenant->id,
            'documentable_type' => Sale::class,
            'documentable_id' => $sale->id,
            'provider' => 'manual',
            'type' => 'nfe',
            'number' => 'NFE-001',
            'status' => 'registered',
            'pdf_url' => 'https://example.test/nfe.pdf',
            'registered_by' => $this->user->id,
        ]);

        $this->assertDatabaseHas('sales', [
            'id' => $sale->id,
            'fiscal_document_number' => 'NFE-001',
            'fiscal_document_url' => 'https://example.test/nfe.pdf',
            'fiscal_registered_by' => $this->user->id,
        ]);
    }

    public function test_it_blocks_manual_fiscal_registration_for_cancelled_sale(): void
    {
        $sale = Sale::factory()->forTenant($this->tenant->id)->create([
            'status' => 'cancelled',
        ]);

        $this->expectException(\RuntimeException::class);
        $this->expectExceptionMessage('Não é possível registrar comprovante fiscal em venda cancelada.');

        app(FiscalDocumentService::class)->registerManualSale($sale, [
            'fiscal_document_number' => 'NFE-001',
        ], $this->user->id);
    }

    public function test_it_blocks_only_the_manual_document_type_enabled_for_focus(): void
    {
        FiscalSetting::create([
            'tenant_id' => $this->tenant->id,
            'enabled' => true,
            'provider' => 'focus_nfe',
            'environment' => 'sandbox',
            'api_token' => 'focus-token',
            'nfe_enabled' => false,
            'nfse_enabled' => true,
        ]);

        $sale = Sale::factory()->forTenant($this->tenant->id)->create(['status' => 'completed']);
        $document = app(FiscalDocumentService::class)->registerManualSale($sale, [
            'fiscal_document_number' => 'NFE-MANUAL-001',
        ], $this->user->id);

        $this->assertSame('manual', $document->provider);

        $order = Order::factory()->forTenant($this->tenant->id)->create();

        $this->expectException(\RuntimeException::class);
        $this->expectExceptionMessage('O registro manual de NFS-e está desativado');

        app(FiscalDocumentService::class)->registerManualOrder($order, [
            'fiscal_document_number' => 'NFSE-MANUAL-001',
        ], $this->user->id);
    }
}
