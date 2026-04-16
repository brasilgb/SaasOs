<?php

namespace Tests\Feature\App;

use App\Models\App\CashSession;
use App\Models\App\Order;
use App\Models\App\OrderPayment;
use App\Models\App\Sale;
use App\Models\Tenant;
use App\Models\User;
use App\Support\OrderStatus;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class CashSessionControllerTest extends TestCase
{
    use RefreshDatabase;

    private Tenant $tenant;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();

        $this->tenant = Tenant::factory()->create();
        $this->user = User::factory()->forTenant($this->tenant->id)->create();
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

    public function test_it_logs_cash_session_opening(): void
    {
        $response = $this->post(route('app.cashier.open'), [
            'opening_balance' => '120,00',
            'notes' => 'Abertura do dia',
        ]);

        $response->assertSessionHas('success', 'Caixa aberto com sucesso.');

        $cashSession = CashSession::query()->firstOrFail();

        $this->assertDatabaseHas('cash_session_logs', [
            'cash_session_id' => $cashSession->id,
            'user_id' => $this->user->id,
            'action' => 'opened',
        ]);
        $this->assertDatabaseHas('operational_audits', [
            'tenant_id' => $this->tenant->id,
            'user_id' => $this->user->id,
            'entity_type' => 'cash_session',
            'entity_id' => $cashSession->id,
            'action' => 'cash_session_opened',
        ]);
    }

    public function test_it_logs_cash_session_closing(): void
    {
        $cashSession = CashSession::create([
            'tenant_id' => $this->tenant->id,
            'opened_by' => $this->user->id,
            'opened_at' => now()->subHour(),
            'opening_balance' => 100,
            'status' => 'open',
        ]);

        $response = $this->post(route('app.cashier.close', $cashSession), [
            'closing_balance' => '150,00',
            'manual_entries' => '20,00',
            'manual_exits' => '10,00',
            'closing_notes' => 'Fechamento sem divergência',
        ]);

        $response->assertSessionHas('success', 'Fechamento diário realizado com sucesso.');

        $this->assertDatabaseHas('cash_session_logs', [
            'cash_session_id' => $cashSession->id,
            'user_id' => $this->user->id,
            'action' => 'closed',
        ]);
        $this->assertDatabaseHas('operational_audits', [
            'tenant_id' => $this->tenant->id,
            'user_id' => $this->user->id,
            'entity_type' => 'cash_session',
            'entity_id' => $cashSession->id,
            'action' => 'cash_session_closed',
        ]);
    }

    public function test_it_blocks_opening_a_second_cash_session(): void
    {
        CashSession::create([
            'tenant_id' => $this->tenant->id,
            'opened_by' => $this->user->id,
            'opened_at' => now()->subHour(),
            'opening_balance' => 50,
            'status' => 'open',
        ]);

        $response = $this->post(route('app.cashier.open'), [
            'opening_balance' => '30,00',
        ]);

        $response->assertSessionHas('error', 'Já existe um caixa aberto para este tenant.');

        $this->assertSame(1, CashSession::query()->count());
    }

    public function test_it_calculates_expected_balance_when_closing_cash_session(): void
    {
        $cashSession = CashSession::create([
            'tenant_id' => $this->tenant->id,
            'opened_by' => $this->user->id,
            'opened_at' => now()->subHour(),
            'opening_balance' => 100,
            'status' => 'open',
        ]);

        Sale::factory()->forTenant($this->tenant->id)->create([
            'cash_session_id' => $cashSession->id,
            'total_amount' => 200,
            'paid_amount' => 200,
            'financial_status' => 'paid',
            'status' => 'completed',
        ]);

        Sale::factory()->forTenant($this->tenant->id)->create([
            'cash_session_id' => $cashSession->id,
            'total_amount' => 80,
            'paid_amount' => 80,
            'financial_status' => 'cancelled',
            'status' => 'cancelled',
        ]);

        $order = Order::factory()->forTenant($this->tenant->id)->create([
            'service_status' => OrderStatus::DELIVERED,
        ]);

        OrderPayment::create([
            'order_id' => $order->id,
            'cash_session_id' => $cashSession->id,
            'payment_method' => 'pix',
            'amount' => 50,
            'paid_at' => now(),
            'notes' => 'Pagamento balcão',
        ]);

        $response = $this->post(route('app.cashier.close', $cashSession), [
            'closing_balance' => '360,00',
            'manual_entries' => '20,00',
            'manual_exits' => '10,00',
            'closing_notes' => 'Fechamento conferido',
        ]);

        $response->assertSessionHas('success', 'Fechamento diário realizado com sucesso.');

        $cashSession->refresh();

        $this->assertSame('closed', $cashSession->status);
        $this->assertEquals(360.0, (float) $cashSession->expected_balance);
        $this->assertEquals(0.0, (float) $cashSession->difference);
        $this->assertEquals(200.0, (float) $cashSession->total_completed_sales);
        $this->assertEquals(80.0, (float) $cashSession->total_cancelled_sales);
        $this->assertEquals(50.0, (float) $cashSession->total_order_payments);
    }
}
