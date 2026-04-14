<?php

namespace Tests\Feature\App;

use App\Models\App\CashSession;
use App\Models\App\Customer;
use App\Models\App\Equipment;
use App\Models\App\Order;
use App\Models\App\OrderPayment;
use App\Models\Tenant;
use App\Models\User;
use App\Support\OrderStatus;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrderControllerTest extends TestCase
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

    public function test_it_registers_initial_status_history_and_log_when_creating_an_order(): void
    {
        $customer = Customer::factory()->forTenant($this->tenant->id)->create();
        $equipment = Equipment::factory()->forTenant($this->tenant->id)->create();

        $response = $this->post(route('app.orders.store'), [
            'customer_id' => $customer->id,
            'equipment_id' => $equipment->id,
            'defect' => 'Não liga',
            'service_status' => OrderStatus::OPEN,
            'user_id' => null,
        ]);

        $response->assertRedirect(route('app.orders.index'));

        $order = Order::query()->firstOrFail();

        $this->assertDatabaseHas('order_status_history', [
            'order_id' => $order->id,
            'status' => OrderStatus::OPEN,
            'changed_by' => $this->user->id,
            'note' => OrderStatus::label(OrderStatus::OPEN),
        ]);

        $this->assertDatabaseHas('order_logs', [
            'order_id' => $order->id,
            'user_id' => $this->user->id,
            'action' => 'created',
        ]);
    }

    public function test_it_records_status_history_and_audit_log_when_order_status_changes(): void
    {
        $customer = Customer::factory()->forTenant($this->tenant->id)->create();
        $equipment = Equipment::factory()->forTenant($this->tenant->id)->create();
        $order = Order::factory()->forTenant($this->tenant->id)->create([
            'customer_id' => $customer->id,
            'equipment_id' => $equipment->id,
            'user_id' => $this->user->id,
            'service_status' => OrderStatus::OPEN,
            'service_cost' => 0,
            'parts_value' => 0,
            'service_value' => 0,
        ]);

        $response = $this->put(route('app.orders.update', $order), [
            'customer_id' => $customer->id,
            'equipment_id' => $equipment->id,
            'user_id' => $this->user->id,
            'model' => $order->model,
            'password' => $order->password,
            'defect' => $order->defect,
            'state_conservation' => $order->state_conservation,
            'accessories' => $order->accessories,
            'budget_description' => 'Troca de componente',
            'budget_value' => '150,00',
            'services_performed' => $order->services_performed,
            'parts_value' => '0,00',
            'service_value' => '150,00',
            'service_cost' => '150,00',
            'delivery_date' => null,
            'service_status' => OrderStatus::BUDGET_GENERATED,
            'delivery_forecast' => null,
            'observations' => 'Aguardando aprovação',
        ]);

        $response->assertRedirect(route('app.orders.show', ['order' => $order->id]));

        $this->assertDatabaseHas('order_status_history', [
            'order_id' => $order->id,
            'status' => OrderStatus::BUDGET_GENERATED,
            'changed_by' => $this->user->id,
            'note' => OrderStatus::label(OrderStatus::BUDGET_GENERATED),
        ]);

        $this->assertDatabaseHas('order_logs', [
            'order_id' => $order->id,
            'user_id' => $this->user->id,
            'action' => 'status_changed',
        ]);
    }

    public function test_it_logs_order_payment_registration(): void
    {
        $customer = Customer::factory()->forTenant($this->tenant->id)->create();
        $equipment = Equipment::factory()->forTenant($this->tenant->id)->create();
        $order = Order::factory()->forTenant($this->tenant->id)->create([
            'customer_id' => $customer->id,
            'equipment_id' => $equipment->id,
            'user_id' => $this->user->id,
            'service_cost' => 200,
            'parts_value' => 0,
            'service_value' => 200,
        ]);

        CashSession::create([
            'tenant_id' => $this->tenant->id,
            'opened_by' => $this->user->id,
            'opened_at' => now(),
            'opening_balance' => 0,
            'status' => 'open',
        ]);

        $response = $this->post(route('app.orders.payments.store', $order), [
            'amount' => '50,00',
            'payment_method' => 'pix',
            'paid_at' => now()->format('Y-m-d\TH:i'),
            'notes' => 'Entrada inicial',
        ]);

        $response->assertSessionHas('success', 'Pagamento registrado com sucesso.');

        $this->assertDatabaseHas('order_payments', [
            'order_id' => $order->id,
            'payment_method' => 'pix',
            'notes' => 'Entrada inicial',
        ]);

        $this->assertDatabaseHas('order_logs', [
            'order_id' => $order->id,
            'user_id' => $this->user->id,
            'action' => 'payment_registered',
        ]);
    }

    public function test_it_blocks_invalid_order_status_transition(): void
    {
        $customer = Customer::factory()->forTenant($this->tenant->id)->create();
        $equipment = Equipment::factory()->forTenant($this->tenant->id)->create();
        $order = Order::factory()->forTenant($this->tenant->id)->create([
            'customer_id' => $customer->id,
            'equipment_id' => $equipment->id,
            'user_id' => $this->user->id,
            'service_status' => OrderStatus::OPEN,
        ]);

        $response = $this->from(route('app.orders.show', $order))->put(route('app.orders.update', $order), [
            'customer_id' => $customer->id,
            'equipment_id' => $equipment->id,
            'user_id' => $this->user->id,
            'model' => $order->model,
            'password' => $order->password,
            'defect' => $order->defect,
            'state_conservation' => $order->state_conservation,
            'accessories' => $order->accessories,
            'budget_description' => null,
            'budget_value' => null,
            'services_performed' => $order->services_performed,
            'parts_value' => '0,00',
            'service_value' => '0,00',
            'service_cost' => '0,00',
            'delivery_date' => null,
            'service_status' => OrderStatus::DELIVERED,
            'delivery_forecast' => null,
            'observations' => null,
        ]);

        $response->assertRedirect(route('app.orders.show', $order));
        $response->assertSessionHasErrors('service_status');

        $this->assertDatabaseMissing('order_status_history', [
            'order_id' => $order->id,
            'status' => OrderStatus::DELIVERED,
        ]);
    }

    public function test_it_blocks_removing_order_payment_from_closed_cash_session(): void
    {
        $customer = Customer::factory()->forTenant($this->tenant->id)->create();
        $equipment = Equipment::factory()->forTenant($this->tenant->id)->create();
        $order = Order::factory()->forTenant($this->tenant->id)->create([
            'customer_id' => $customer->id,
            'equipment_id' => $equipment->id,
            'user_id' => $this->user->id,
            'service_cost' => 200,
        ]);

        $cashSession = CashSession::create([
            'tenant_id' => $this->tenant->id,
            'opened_by' => $this->user->id,
            'closed_by' => $this->user->id,
            'opened_at' => now()->subHours(3),
            'closed_at' => now()->subHour(),
            'opening_balance' => 0,
            'closing_balance' => 50,
            'expected_balance' => 50,
            'difference' => 0,
            'status' => 'closed',
        ]);

        $payment = OrderPayment::create([
            'order_id' => $order->id,
            'cash_session_id' => $cashSession->id,
            'amount' => 50,
            'payment_method' => 'pix',
            'paid_at' => now(),
            'notes' => 'Pagamento bloqueado',
        ]);

        $response = $this->delete(route('app.orders.payments.destroy', [$order, $payment]));

        $response->assertSessionHas('error', 'Não é possível remover pagamento vinculado a um caixa já fechado.');

        $this->assertDatabaseHas('order_payments', [
            'id' => $payment->id,
        ]);
    }

    public function test_it_calculates_warranty_expiration_when_updating_order(): void
    {
        $customer = Customer::factory()->forTenant($this->tenant->id)->create();
        $equipment = Equipment::factory()->forTenant($this->tenant->id)->create();
        $order = Order::factory()->forTenant($this->tenant->id)->create([
            'customer_id' => $customer->id,
            'equipment_id' => $equipment->id,
            'user_id' => $this->user->id,
            'service_status' => OrderStatus::SERVICE_COMPLETED,
        ]);

        $deliveryDate = now()->setTime(10, 0, 0);

        $response = $this->put(route('app.orders.update', $order), [
            'customer_id' => $customer->id,
            'equipment_id' => $equipment->id,
            'user_id' => $this->user->id,
            'model' => $order->model,
            'password' => $order->password,
            'defect' => $order->defect,
            'state_conservation' => $order->state_conservation,
            'accessories' => $order->accessories,
            'budget_description' => $order->budget_description,
            'budget_value' => '0,00',
            'services_performed' => $order->services_performed,
            'parts_value' => '0,00',
            'service_value' => '100,00',
            'service_cost' => '100,00',
            'delivery_date' => $deliveryDate->format('Y-m-d H:i:s'),
            'warranty_days' => 90,
            'service_status' => OrderStatus::SERVICE_COMPLETED,
            'delivery_forecast' => null,
            'observations' => null,
        ]);

        $response->assertRedirect(route('app.orders.show', ['order' => $order->id]));

        $this->assertDatabaseHas('orders', [
            'id' => $order->id,
            'warranty_days' => 90,
        ]);

        $this->assertEquals(
            $deliveryDate->copy()->addDays(90)->toDateTimeString(),
            $order->fresh()->warranty_expires_at?->toDateTimeString()
        );
    }

    public function test_it_marks_new_order_as_warranty_return_when_previous_covered_order_exists(): void
    {
        $customer = Customer::factory()->forTenant($this->tenant->id)->create();
        $equipment = Equipment::factory()->forTenant($this->tenant->id)->create();

        $coveredOrder = Order::factory()->forTenant($this->tenant->id)->create([
            'customer_id' => $customer->id,
            'equipment_id' => $equipment->id,
            'user_id' => $this->user->id,
            'model' => 'Notebook Dell',
            'delivery_date' => now()->subDays(10),
            'warranty_days' => 30,
            'warranty_expires_at' => now()->addDays(20),
        ]);

        $response = $this->post(route('app.orders.store'), [
            'customer_id' => $customer->id,
            'equipment_id' => $equipment->id,
            'model' => 'Notebook Dell',
            'defect' => 'Não liga novamente',
            'service_status' => OrderStatus::OPEN,
            'user_id' => $this->user->id,
        ]);

        $response->assertRedirect(route('app.orders.index'));

        $newOrder = Order::query()->whereKeyNot($coveredOrder->id)->latest('id')->firstOrFail();

        $this->assertTrue((bool) $newOrder->is_warranty_return);
        $this->assertSame($coveredOrder->id, $newOrder->warranty_source_order_id);
    }

    public function test_it_filters_orders_by_warranty_return(): void
    {
        $customer = Customer::factory()->forTenant($this->tenant->id)->create();
        $equipment = Equipment::factory()->forTenant($this->tenant->id)->create();

        $warrantyReturnOrder = Order::factory()->forTenant($this->tenant->id)->create([
            'customer_id' => $customer->id,
            'equipment_id' => $equipment->id,
            'user_id' => $this->user->id,
            'is_warranty_return' => true,
        ]);

        $regularOrder = Order::factory()->forTenant($this->tenant->id)->create([
            'customer_id' => $customer->id,
            'equipment_id' => $equipment->id,
            'user_id' => $this->user->id,
            'is_warranty_return' => false,
        ]);

        $response = $this->get(route('app.orders.index', ['filter' => 'warranty_return']));

        $response
            ->assertOk()
            ->assertViewHas('page.props.filter', 'warranty_return')
            ->assertViewHas('page.props.orders.data', function (array $orders) use ($warrantyReturnOrder, $regularOrder) {
                $orderIds = collect($orders)->pluck('id');

                return $orderIds->contains($warrantyReturnOrder->id)
                    && ! $orderIds->contains($regularOrder->id);
            });
    }

    public function test_it_filters_orders_for_budget_follow_up(): void
    {
        $customer = Customer::factory()->forTenant($this->tenant->id)->create();
        $equipment = Equipment::factory()->forTenant($this->tenant->id)->create();

        $stalledBudgetOrder = Order::factory()->forTenant($this->tenant->id)->create([
            'customer_id' => $customer->id,
            'equipment_id' => $equipment->id,
            'user_id' => $this->user->id,
            'service_status' => OrderStatus::BUDGET_GENERATED,
            'updated_at' => now()->subDays(3),
        ]);

        $recentBudgetOrder = Order::factory()->forTenant($this->tenant->id)->create([
            'customer_id' => $customer->id,
            'equipment_id' => $equipment->id,
            'user_id' => $this->user->id,
            'service_status' => OrderStatus::BUDGET_GENERATED,
            'updated_at' => now()->subDay(),
        ]);

        $response = $this->get(route('app.orders.index', ['filter' => 'budget_follow_up']));

        $response
            ->assertOk()
            ->assertViewHas('page.props.filter', 'budget_follow_up')
            ->assertViewHas('page.props.orders.data', function (array $orders) use ($stalledBudgetOrder, $recentBudgetOrder) {
                $orderIds = collect($orders)->pluck('id');

                return $orderIds->contains($stalledBudgetOrder->id)
                    && ! $orderIds->contains($recentBudgetOrder->id);
            });
    }

    public function test_it_filters_orders_for_pending_payment_follow_up(): void
    {
        $customer = Customer::factory()->forTenant($this->tenant->id)->create();
        $equipment = Equipment::factory()->forTenant($this->tenant->id)->create();

        $chargeOrder = Order::factory()->forTenant($this->tenant->id)->create([
            'customer_id' => $customer->id,
            'equipment_id' => $equipment->id,
            'user_id' => $this->user->id,
            'service_status' => OrderStatus::DELIVERED,
            'service_cost' => 300,
            'delivery_date' => now()->subDays(4),
        ]);

        OrderPayment::create([
            'order_id' => $chargeOrder->id,
            'amount' => 100,
            'payment_method' => 'pix',
            'paid_at' => now()->subDays(3),
        ]);

        $settledOrder = Order::factory()->forTenant($this->tenant->id)->create([
            'customer_id' => $customer->id,
            'equipment_id' => $equipment->id,
            'user_id' => $this->user->id,
            'service_status' => OrderStatus::DELIVERED,
            'service_cost' => 300,
            'delivery_date' => now()->subDays(4),
        ]);

        OrderPayment::create([
            'order_id' => $settledOrder->id,
            'amount' => 300,
            'payment_method' => 'pix',
            'paid_at' => now()->subDays(3),
        ]);

        $response = $this->get(route('app.orders.index', ['filter' => 'pending_payment_follow_up']));

        $response
            ->assertOk()
            ->assertViewHas('page.props.filter', 'pending_payment_follow_up')
            ->assertViewHas('page.props.orders.data', function (array $orders) use ($chargeOrder, $settledOrder) {
                $orderIds = collect($orders)->pluck('id');

                return $orderIds->contains($chargeOrder->id)
                    && ! $orderIds->contains($settledOrder->id);
            });
    }
}
