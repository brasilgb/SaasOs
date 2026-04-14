<?php

namespace Tests\Feature\App;

use App\Models\App\Customer;
use App\Models\App\CashSession;
use App\Models\App\Part;
use App\Models\App\Sale;
use App\Models\App\SaleItem;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class SaleControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    private Tenant $tenant;

    protected function setUp(): void
    {
        parent::setUp();

        $this->tenant = Tenant::factory()->create(['name' => 'Test Tenant']);
        $this->user = User::factory()->create(['tenant_id' => $this->tenant->id]);
        DB::table('others')->insert([
            'tenant_id' => $this->tenant->id,
            'navigation' => false,
            'enableparts' => false,
            'enablesales' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $this->withSession(['tenant_id' => $this->tenant->id])
            ->actingAs($this->user);
    }

    /** @test */
    public function it_can_create_a_sale()
    {
        $customer = Customer::factory()->create(['tenant_id' => $this->tenant->id]);
        $part1 = Part::factory()->create(['tenant_id' => $this->tenant->id, 'quantity' => 10, 'sale_price' => 100]);
        $part2 = Part::factory()->create(['tenant_id' => $this->tenant->id, 'quantity' => 5, 'sale_price' => 200]);
        \App\Models\App\CashSession::create([
            'tenant_id' => $this->tenant->id,
            'opened_by' => $this->user->id,
            'opened_at' => now(),
            'opening_balance' => 0,
            'status' => 'open',
        ]);

        $saleData = [
            'customer_id' => $customer->id,
            'total_amount' => 400,
            'paid_amount' => 400,
            'payment_method' => 'pix',
            'parts' => [
                ['part_id' => $part1->id, 'quantity' => 2],
                ['part_id' => $part2->id, 'quantity' => 1],
            ],
        ];

        $response = $this->postJson(route('app.sales.store'), $saleData);

        $response->assertOk()
            ->assertJson([
                'success' => true,
            ]);

        $this->assertDatabaseHas('sales', [
            'customer_id' => $customer->id,
            'total_amount' => 400,
        ]);

        $this->assertDatabaseHas('sale_items', [
            'part_id' => $part1->id,
            'quantity' => 2,
            'unit_price' => 100,
        ]);

        $this->assertDatabaseHas('sale_items', [
            'part_id' => $part2->id,
            'quantity' => 1,
            'unit_price' => 200,
        ]);

        $this->assertEquals(8, $part1->fresh()->quantity);
        $this->assertEquals(4, $part2->fresh()->quantity);
        $sale = Sale::query()->firstOrFail();
        $this->assertDatabaseHas('sale_logs', [
            'sale_id' => $sale->id,
            'user_id' => $this->user->id,
            'action' => 'created',
        ]);
    }

    public function test_it_blocks_sale_cancellation_when_cash_session_is_closed(): void
    {
        $part = Part::factory()->create(['tenant_id' => $this->tenant->id, 'quantity' => 10, 'sale_price' => 100]);
        $cashSession = CashSession::create([
            'tenant_id' => $this->tenant->id,
            'opened_by' => $this->user->id,
            'closed_by' => $this->user->id,
            'opened_at' => now()->subHours(2),
            'closed_at' => now()->subHour(),
            'opening_balance' => 0,
            'closing_balance' => 100,
            'expected_balance' => 100,
            'difference' => 0,
            'status' => 'closed',
        ]);

        $sale = Sale::factory()->forTenant($this->tenant->id)->create([
            'cash_session_id' => $cashSession->id,
            'status' => 'completed',
            'financial_status' => 'paid',
        ]);

        SaleItem::create([
            'sale_id' => $sale->id,
            'part_id' => $part->id,
            'quantity' => 1,
            'unit_price' => 100,
        ]);

        $response = $this->post(route('app.sales.cancel', $sale), [
            'cancel_reason' => 'Cliente desistiu depois do fechamento.',
        ]);

        $response->assertSessionHas('error', 'Não é possível cancelar venda vinculada a caixa já fechado.');

        $this->assertDatabaseHas('sales', [
            'id' => $sale->id,
            'status' => 'completed',
        ]);
    }

    public function test_it_blocks_sale_deletion_when_sale_is_not_cancelled(): void
    {
        $cashSession = CashSession::create([
            'tenant_id' => $this->tenant->id,
            'opened_by' => $this->user->id,
            'opened_at' => now(),
            'opening_balance' => 0,
            'status' => 'open',
        ]);

        $sale = Sale::factory()->forTenant($this->tenant->id)->create([
            'cash_session_id' => $cashSession->id,
            'status' => 'completed',
            'financial_status' => 'paid',
        ]);

        $response = $this->delete(route('app.sales.destroy', $sale));

        $response->assertSessionHas('error', 'Somente vendas canceladas podem ser excluídas.');

        $this->assertDatabaseHas('sales', [
            'id' => $sale->id,
        ]);
    }
}
