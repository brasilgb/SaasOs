<?php

namespace Tests\Feature\App;

use App\Models\App\CashSession;
use App\Models\App\CashSessionMovement;
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
            'enable_finance' => true,
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

    public function test_it_registers_cash_session_withdrawal(): void
    {
        $cashSession = CashSession::create([
            'tenant_id' => $this->tenant->id,
            'opened_by' => $this->user->id,
            'opened_at' => now()->subHour(),
            'opening_balance' => 100,
            'status' => 'open',
        ]);

        $response = $this->post(route('app.cashier.withdrawal', $cashSession), [
            'amount' => '40,00',
            'description' => 'Retirada para cofre',
        ]);

        $response->assertSessionHas('success', 'Sangria registrada com sucesso.');

        $this->assertDatabaseHas('cash_session_movements', [
            'tenant_id' => $this->tenant->id,
            'cash_session_id' => $cashSession->id,
            'user_id' => $this->user->id,
            'type' => CashSessionMovement::TYPE_WITHDRAWAL,
            'amount' => 40,
            'description' => 'Retirada para cofre',
        ]);
        $this->assertDatabaseHas('cash_session_logs', [
            'cash_session_id' => $cashSession->id,
            'user_id' => $this->user->id,
            'action' => 'withdrawal_registered',
        ]);
        $this->assertDatabaseHas('operational_audits', [
            'tenant_id' => $this->tenant->id,
            'user_id' => $this->user->id,
            'entity_type' => 'cash_session',
            'entity_id' => $cashSession->id,
            'action' => 'cash_session_withdrawal_registered',
        ]);
    }

    public function test_it_subtracts_withdrawals_when_closing_cash_session(): void
    {
        $cashSession = CashSession::create([
            'tenant_id' => $this->tenant->id,
            'opened_by' => $this->user->id,
            'opened_at' => now()->subHour(),
            'opening_balance' => 100,
            'status' => 'open',
        ]);

        CashSessionMovement::create([
            'tenant_id' => $this->tenant->id,
            'cash_session_id' => $cashSession->id,
            'user_id' => $this->user->id,
            'type' => CashSessionMovement::TYPE_WITHDRAWAL,
            'amount' => 30,
            'description' => 'Retirada para depósito',
        ]);

        $response = $this->post(route('app.cashier.close', $cashSession), [
            'closing_balance' => '90,00',
            'manual_entries' => '25,00',
            'manual_exits' => '5,00',
            'closing_notes' => 'Fechamento conferido',
        ]);

        $response->assertSessionHas('success', 'Fechamento diário realizado com sucesso.');

        $cashSession->refresh();

        $this->assertEquals(90.0, (float) $cashSession->expected_balance);
        $this->assertEquals(0.0, (float) $cashSession->difference);
    }

    public function test_it_cancels_cash_session_withdrawal(): void
    {
        $cashSession = CashSession::create([
            'tenant_id' => $this->tenant->id,
            'opened_by' => $this->user->id,
            'opened_at' => now()->subHour(),
            'opening_balance' => 100,
            'status' => 'open',
        ]);

        $movement = CashSessionMovement::create([
            'tenant_id' => $this->tenant->id,
            'cash_session_id' => $cashSession->id,
            'user_id' => $this->user->id,
            'type' => CashSessionMovement::TYPE_WITHDRAWAL,
            'amount' => 40,
            'description' => 'Retirada com valor errado',
        ]);

        $response = $this->post(route('app.cashier.withdrawal.cancel', [$cashSession, $movement]), [
            'cancellation_reason' => 'Valor digitado incorretamente',
        ]);

        $response->assertSessionHas('success', 'Sangria cancelada com sucesso.');

        $movement->refresh();

        $this->assertNotNull($movement->cancelled_at);
        $this->assertSame($this->user->id, (int) $movement->cancelled_by);
        $this->assertSame('Valor digitado incorretamente', $movement->cancellation_reason);
        $this->assertDatabaseHas('cash_session_logs', [
            'cash_session_id' => $cashSession->id,
            'user_id' => $this->user->id,
            'action' => 'withdrawal_cancelled',
        ]);
        $this->assertDatabaseHas('operational_audits', [
            'tenant_id' => $this->tenant->id,
            'user_id' => $this->user->id,
            'entity_type' => 'cash_session',
            'entity_id' => $cashSession->id,
            'action' => 'cash_session_withdrawal_cancelled',
        ]);
    }

    public function test_it_ignores_cancelled_withdrawals_when_closing_cash_session(): void
    {
        $cashSession = CashSession::create([
            'tenant_id' => $this->tenant->id,
            'opened_by' => $this->user->id,
            'opened_at' => now()->subHour(),
            'opening_balance' => 100,
            'status' => 'open',
        ]);

        CashSessionMovement::create([
            'tenant_id' => $this->tenant->id,
            'cash_session_id' => $cashSession->id,
            'user_id' => $this->user->id,
            'type' => CashSessionMovement::TYPE_WITHDRAWAL,
            'amount' => 30,
            'description' => 'Retirada cancelada',
            'cancelled_at' => now(),
            'cancelled_by' => $this->user->id,
            'cancellation_reason' => 'Valor errado',
        ]);

        $response = $this->post(route('app.cashier.close', $cashSession), [
            'closing_balance' => '100,00',
            'manual_entries' => '0,00',
            'manual_exits' => '0,00',
        ]);

        $response->assertSessionHas('success', 'Fechamento diário realizado com sucesso.');

        $cashSession->refresh();

        $this->assertEquals(100.0, (float) $cashSession->expected_balance);
        $this->assertEquals(0.0, (float) $cashSession->difference);
    }

    public function test_it_blocks_withdrawal_cancellation_when_cash_session_is_closed(): void
    {
        $cashSession = CashSession::create([
            'tenant_id' => $this->tenant->id,
            'opened_by' => $this->user->id,
            'opened_at' => now()->subHour(),
            'opening_balance' => 100,
            'status' => 'closed',
        ]);

        $movement = CashSessionMovement::create([
            'tenant_id' => $this->tenant->id,
            'cash_session_id' => $cashSession->id,
            'user_id' => $this->user->id,
            'type' => CashSessionMovement::TYPE_WITHDRAWAL,
            'amount' => 40,
            'description' => 'Retirada para cofre',
        ]);

        $response = $this->post(route('app.cashier.withdrawal.cancel', [$cashSession, $movement]), [
            'cancellation_reason' => 'Valor errado',
        ]);

        $response->assertSessionHas('error', 'Este caixa já está fechado.');

        $this->assertNull($movement->fresh()->cancelled_at);
    }

    public function test_it_blocks_withdrawal_greater_than_current_expected_balance(): void
    {
        $cashSession = CashSession::create([
            'tenant_id' => $this->tenant->id,
            'opened_by' => $this->user->id,
            'opened_at' => now()->subHour(),
            'opening_balance' => 100,
            'status' => 'open',
        ]);

        $response = $this->post(route('app.cashier.withdrawal', $cashSession), [
            'amount' => '150,00',
            'description' => 'Retirada acima do saldo',
        ]);

        $response->assertSessionHas('error', 'O valor da sangria não pode ser maior que o saldo esperado atual.');

        $this->assertDatabaseCount('cash_session_movements', 0);
    }
}
