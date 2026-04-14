<?php

namespace Tests\Feature;

use App\Models\App\Customer;
use App\Models\App\Equipment;
use App\Models\App\Order;
use App\Models\Tenant;
use App\Support\OrderStatus;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OsControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_customer_can_approve_budget_only_from_budget_generated_status(): void
    {
        $tenant = Tenant::factory()->create();
        $customer = Customer::factory()->forTenant($tenant->id)->create();
        $equipment = Equipment::factory()->forTenant($tenant->id)->create();
        $order = Order::factory()->forTenant($tenant->id)->create([
            'customer_id' => $customer->id,
            'equipment_id' => $equipment->id,
            'service_status' => OrderStatus::BUDGET_GENERATED,
        ]);

        $response = $this->post(route('orders.budget.status', $order->tracking_token), [
            'status' => OrderStatus::BUDGET_APPROVED,
        ]);

        $response->assertSessionHas('success', 'Status do orçamento atualizado com sucesso.');

        $this->assertDatabaseHas('orders', [
            'id' => $order->id,
            'service_status' => OrderStatus::BUDGET_APPROVED,
        ]);

        $this->assertDatabaseHas('order_status_history', [
            'order_id' => $order->id,
            'status' => OrderStatus::BUDGET_APPROVED,
            'note' => OrderStatus::label(OrderStatus::BUDGET_APPROVED),
        ]);
    }

    public function test_customer_cannot_jump_budget_status_after_it_is_already_processed(): void
    {
        $tenant = Tenant::factory()->create();
        $customer = Customer::factory()->forTenant($tenant->id)->create();
        $equipment = Equipment::factory()->forTenant($tenant->id)->create();
        $order = Order::factory()->forTenant($tenant->id)->create([
            'customer_id' => $customer->id,
            'equipment_id' => $equipment->id,
            'service_status' => OrderStatus::BUDGET_APPROVED,
        ]);

        $response = $this->from(route('os.token', $order->tracking_token))->post(route('orders.budget.status', $order->tracking_token), [
            'status' => OrderStatus::BUDGET_REJECTED,
        ]);

        $response->assertRedirect(route('os.token', $order->tracking_token));
        $response->assertSessionHasErrors('status');

        $this->assertDatabaseMissing('order_status_history', [
            'order_id' => $order->id,
            'status' => OrderStatus::BUDGET_REJECTED,
        ]);
    }
}
