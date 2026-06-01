<?php

namespace Tests\Feature\App;

use App\Models\App\Customer;
use App\Models\App\Order;
use App\Models\App\Other;
use App\Models\App\Schedule;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ScheduleControllerTest extends TestCase
{
    use RefreshDatabase;

    private Tenant $tenant;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();

        $this->tenant = Tenant::factory()->create();
        $this->user = User::factory()->forTenant($this->tenant->id)->create();
        Other::factory()->forTenant($this->tenant->id)->create([
            'enable_technician_schedule_notifications' => true,
        ]);

        $this->withSession(['tenant_id' => $this->tenant->id])
            ->actingAs($this->user);
    }

    public function test_it_creates_schedule_with_required_customer_order_and_send_to_technician_flag(): void
    {
        $customer = Customer::factory()->forTenant($this->tenant->id)->create();
        $order = Order::factory()->forTenant($this->tenant->id)->create([
            'customer_id' => $customer->id,
            'user_id' => $this->user->id,
        ]);

        $response = $this->post(route('app.schedules.store'), [
            'customer_id' => $customer->id,
            'order_id' => $order->id,
            'user_id' => $this->user->id,
            'schedules' => now()->addDay()->format('Y-m-d H:i:s'),
            'service' => 'Visita tecnica',
            'details' => 'Verificar equipamento do cliente',
            'status' => 1,
            'send_to_technician' => true,
        ]);

        $response->assertRedirect(route('app.schedules.index'));

        $this->assertDatabaseHas('schedules', [
            'tenant_id' => $this->tenant->id,
            'customer_id' => $customer->id,
            'order_id' => $order->id,
            'user_id' => $this->user->id,
            'service' => 'Visita tecnica',
            'send_to_technician' => true,
        ]);
    }

    public function test_it_rejects_schedule_order_from_another_customer(): void
    {
        $customer = Customer::factory()->forTenant($this->tenant->id)->create();
        $otherCustomer = Customer::factory()->forTenant($this->tenant->id)->create();
        $otherOrder = Order::factory()->forTenant($this->tenant->id)->create([
            'customer_id' => $otherCustomer->id,
            'user_id' => $this->user->id,
        ]);

        $response = $this->post(route('app.schedules.store'), [
            'customer_id' => $customer->id,
            'order_id' => $otherOrder->id,
            'user_id' => $this->user->id,
            'schedules' => now()->addDay()->format('Y-m-d H:i:s'),
            'service' => 'Visita tecnica',
            'details' => 'Verificar equipamento do cliente',
            'status' => 1,
            'send_to_technician' => false,
        ]);

        $response->assertNotFound();
        $this->assertDatabaseCount('schedules', 0);
    }

    public function test_it_disables_send_to_technician_when_setting_is_off(): void
    {
        Other::query()
            ->where('tenant_id', $this->tenant->id)
            ->update(['enable_technician_schedule_notifications' => false]);

        $customer = Customer::factory()->forTenant($this->tenant->id)->create();
        $order = Order::factory()->forTenant($this->tenant->id)->create([
            'customer_id' => $customer->id,
            'user_id' => $this->user->id,
        ]);

        $response = $this->post(route('app.schedules.store'), [
            'customer_id' => $customer->id,
            'order_id' => $order->id,
            'user_id' => $this->user->id,
            'schedules' => now()->addDay()->format('Y-m-d H:i:s'),
            'service' => 'Visita tecnica',
            'details' => 'Verificar equipamento do cliente',
            'status' => 1,
            'send_to_technician' => true,
        ]);

        $response->assertRedirect(route('app.schedules.index'));

        $this->assertDatabaseHas('schedules', [
            'tenant_id' => $this->tenant->id,
            'order_id' => $order->id,
            'send_to_technician' => false,
        ]);
    }
}
