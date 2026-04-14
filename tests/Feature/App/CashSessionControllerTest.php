<?php

namespace Tests\Feature\App;

use App\Models\App\CashSession;
use App\Models\Tenant;
use App\Models\User;
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
    }
}
