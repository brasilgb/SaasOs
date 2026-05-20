<?php

namespace Tests\Feature\App;

use App\Models\App\Customer;
use App\Models\App\Equipment;
use App\Models\App\Order;
use App\Models\App\OrderPayment;
use App\Models\Tenant;
use App\Models\User;
use App\Support\OrderStatus;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CustomerControllerTest extends TestCase
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

    public function test_it_blocks_customer_deletion_when_customer_has_linked_orders(): void
    {
        $customer = Customer::factory()->forTenant($this->tenant->id)->create();
        $equipment = Equipment::factory()->forTenant($this->tenant->id)->create();

        Order::factory()->forTenant($this->tenant->id)->create([
            'customer_id' => $customer->id,
            'equipment_id' => $equipment->id,
            'user_id' => $this->user->id,
        ]);

        $response = $this->delete(route('app.customers.destroy', $customer));

        $response->assertSessionHas(
            'error',
            'Não é possível excluir este cliente porque existem ordens, vendas ou agendamentos vinculados.'
        );

        $this->assertDatabaseHas('customers', [
            'id' => $customer->id,
        ]);
    }

    public function test_it_counts_pending_balance_only_from_delivered_orders(): void
    {
        $customer = Customer::factory()->forTenant($this->tenant->id)->create();
        $equipment = Equipment::factory()->forTenant($this->tenant->id)->create();

        Order::factory()->forTenant($this->tenant->id)->create([
            'customer_id' => $customer->id,
            'equipment_id' => $equipment->id,
            'user_id' => $this->user->id,
            'service_status' => OrderStatus::BUDGET_GENERATED,
            'service_cost' => 500,
        ]);

        $deliveredOrder = Order::factory()->forTenant($this->tenant->id)->create([
            'customer_id' => $customer->id,
            'equipment_id' => $equipment->id,
            'user_id' => $this->user->id,
            'service_status' => OrderStatus::DELIVERED,
            'service_cost' => 300,
            'delivery_date' => now()->subDay(),
        ]);

        OrderPayment::create([
            'order_id' => $deliveredOrder->id,
            'amount' => 100,
            'payment_method' => 'pix',
            'paid_at' => now(),
        ]);

        $response = $this->get(route('app.customers.index'));

        $response
            ->assertOk()
            ->assertViewHas('page.props.customers.data', function (array $customers) use ($customer) {
                $row = collect($customers)->firstWhere('id', $customer->id);

                return $row && (float) $row['pending_amount'] === 200.0;
            });
    }

    public function test_pending_filter_ignores_non_delivered_orders(): void
    {
        $customer = Customer::factory()->forTenant($this->tenant->id)->create();
        $equipment = Equipment::factory()->forTenant($this->tenant->id)->create();

        Order::factory()->forTenant($this->tenant->id)->create([
            'customer_id' => $customer->id,
            'equipment_id' => $equipment->id,
            'user_id' => $this->user->id,
            'service_status' => OrderStatus::BUDGET_GENERATED,
            'service_cost' => 500,
        ]);

        $response = $this->get(route('app.customers.index', ['pending' => 1]));

        $response
            ->assertOk()
            ->assertViewHas('page.props.customers.data', function (array $customers) use ($customer) {
                return ! collect($customers)->pluck('id')->contains($customer->id);
            });
    }
}
