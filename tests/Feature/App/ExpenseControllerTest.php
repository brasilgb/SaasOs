<?php

namespace Tests\Feature\App;

use App\Models\App\Expense;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class ExpenseControllerTest extends TestCase
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

    public function test_it_logs_expense_creation_update_and_deletion(): void
    {
        $createResponse = $this->post(route('app.expenses.store'), [
            'expense_date' => now()->toDateString(),
            'description' => 'Compra de material de limpeza',
            'category' => 'Operacional',
            'amount' => 55.90,
            'notes' => 'Reposição semanal',
        ]);

        $createResponse->assertSessionHas('success', 'Despesa cadastrada com sucesso.');

        $expense = Expense::query()->firstOrFail();

        $this->assertDatabaseHas('expense_logs', [
            'expense_id' => $expense->id,
            'user_id' => $this->user->id,
            'action' => 'created',
        ]);

        $updateResponse = $this->put(route('app.expenses.update', $expense), [
            'expense_date' => now()->toDateString(),
            'description' => 'Compra de material de limpeza',
            'category' => 'Administrativo',
            'amount' => 60.00,
            'notes' => 'Valor ajustado',
        ]);

        $updateResponse->assertSessionHas('success', 'Despesa atualizada com sucesso.');

        $this->assertDatabaseHas('expense_logs', [
            'expense_id' => $expense->id,
            'user_id' => $this->user->id,
            'action' => 'updated',
        ]);

        $deleteResponse = $this->delete(route('app.expenses.destroy', $expense));

        $deleteResponse->assertSessionHas('success', 'Despesa excluída com sucesso.');

        $this->assertDatabaseMissing('expenses', [
            'id' => $expense->id,
        ]);
    }
}
