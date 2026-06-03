<?php

namespace Tests\Feature\App;

use App\Models\App\Customer;
use App\Models\App\Equipment;
use App\Models\App\Order;
use App\Models\App\Schedule;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TechnicianScheduleApiTest extends TestCase
{
    use RefreshDatabase;

    private Tenant $tenant;

    private User $technician;

    protected function setUp(): void
    {
        parent::setUp();

        $this->tenant = Tenant::factory()->create();
        $this->technician = User::factory()->forTenant($this->tenant->id)->create([
            'roles' => User::ROLE_TECHNICIAN,
        ]);
    }

    public function test_technician_lists_only_sent_own_schedules(): void
    {
        $customer = Customer::factory()->forTenant($this->tenant->id)->create([
            'name' => 'Cliente Campo',
            'city' => 'Porto Alegre',
        ]);
        $equipment = Equipment::factory()->forTenant($this->tenant->id)->create([
            'equipment' => 'Notebook',
        ]);
        $order = Order::factory()->forTenant($this->tenant->id)->create([
            'customer_id' => $customer->id,
            'equipment_id' => $equipment->id,
            'user_id' => $this->technician->id,
            'model' => 'Dell Inspiron',
            'defect' => 'Nao liga',
        ]);
        $sentSchedule = Schedule::factory()->forTenant($this->tenant->id)->create([
            'customer_id' => $customer->id,
            'order_id' => $order->id,
            'user_id' => $this->technician->id,
            'send_to_technician' => true,
            'service' => 'Atendimento externo',
        ]);
        Schedule::factory()->forTenant($this->tenant->id)->create([
            'customer_id' => $customer->id,
            'order_id' => $order->id,
            'user_id' => $this->technician->id,
            'send_to_technician' => false,
        ]);

        $response = $this->actingAs($this->technician, 'sanctum')
            ->getJson(route('api.technician.schedules.index'));

        $response
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('result.data.0.id', $sentSchedule->id)
            ->assertJsonPath('result.data.0.customer.name', 'Cliente Campo')
            ->assertJsonPath('result.data.0.order.model', 'Dell Inspiron')
            ->assertJsonPath('result.data.0.order.equipment.equipment', 'Notebook')
            ->assertJsonCount(1, 'result.data');
    }

    public function test_technician_cannot_open_schedule_from_another_technician(): void
    {
        $otherTechnician = User::factory()->forTenant($this->tenant->id)->create([
            'roles' => User::ROLE_TECHNICIAN,
        ]);
        $customer = Customer::factory()->forTenant($this->tenant->id)->create();
        $order = Order::factory()->forTenant($this->tenant->id)->create([
            'customer_id' => $customer->id,
            'user_id' => $otherTechnician->id,
        ]);
        $schedule = Schedule::factory()->forTenant($this->tenant->id)->create([
            'customer_id' => $customer->id,
            'order_id' => $order->id,
            'user_id' => $otherTechnician->id,
            'send_to_technician' => true,
        ]);

        $this->actingAs($this->technician, 'sanctum')
            ->getJson(route('api.technician.schedules.show', $schedule))
            ->assertNotFound();
    }

    public function test_non_technician_cannot_use_technician_schedule_api(): void
    {
        $operator = User::factory()->forTenant($this->tenant->id)->create([
            'roles' => User::ROLE_OPERATOR,
        ]);

        $this->actingAs($operator, 'sanctum')
            ->getJson(route('api.technician.schedules.index'))
            ->assertForbidden();
    }

    public function test_technician_dashboard_returns_summary_and_next_schedule(): void
    {
        $customer = Customer::factory()->forTenant($this->tenant->id)->create([
            'name' => 'Cliente Prioritario',
        ]);
        $order = Order::factory()->forTenant($this->tenant->id)->create([
            'customer_id' => $customer->id,
            'user_id' => $this->technician->id,
        ]);
        $nextSchedule = Schedule::factory()->forTenant($this->tenant->id)->create([
            'customer_id' => $customer->id,
            'order_id' => $order->id,
            'user_id' => $this->technician->id,
            'send_to_technician' => true,
            'schedules' => now()->addHour(),
            'status' => 1,
        ]);
        Schedule::factory()->forTenant($this->tenant->id)->create([
            'customer_id' => $customer->id,
            'order_id' => $order->id,
            'user_id' => $this->technician->id,
            'send_to_technician' => true,
            'schedules' => now()->addHours(2),
            'status' => 2,
        ]);
        Schedule::factory()->forTenant($this->tenant->id)->create([
            'customer_id' => $customer->id,
            'order_id' => $order->id,
            'user_id' => $this->technician->id,
            'send_to_technician' => true,
            'schedules' => now()->subHour(),
            'status' => 3,
        ]);

        $response = $this->actingAs($this->technician, 'sanctum')
            ->getJson(route('api.technician.dashboard'));

        $response
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('result.summary.today', 3)
            ->assertJsonPath('result.summary.pending', 2)
            ->assertJsonPath('result.summary.completed', 1)
            ->assertJsonPath('result.next_schedule.id', $nextSchedule->id)
            ->assertJsonPath('result.next_schedule.customer.name', 'Cliente Prioritario');
    }

    public function test_technician_updates_schedule_status(): void
    {
        $customer = Customer::factory()->forTenant($this->tenant->id)->create();
        $order = Order::factory()->forTenant($this->tenant->id)->create([
            'customer_id' => $customer->id,
            'user_id' => $this->technician->id,
        ]);
        $schedule = Schedule::factory()->forTenant($this->tenant->id)->create([
            'customer_id' => $customer->id,
            'order_id' => $order->id,
            'user_id' => $this->technician->id,
            'send_to_technician' => true,
            'status' => 1,
        ]);

        $response = $this->actingAs($this->technician, 'sanctum')
            ->postJson(route('api.technician.schedules.status', $schedule), [
                'status' => 2,
            ]);

        $response
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('result.status', 2)
            ->assertJsonPath('result.status_label', 'Em atendimento');

        $this->assertDatabaseHas('schedules', [
            'id' => $schedule->id,
            'status' => 2,
        ]);
    }

    public function test_technician_registers_check_in_with_gps(): void
    {
        $customer = Customer::factory()->forTenant($this->tenant->id)->create();
        $order = Order::factory()->forTenant($this->tenant->id)->create([
            'customer_id' => $customer->id,
            'user_id' => $this->technician->id,
        ]);
        $schedule = Schedule::factory()->forTenant($this->tenant->id)->create([
            'customer_id' => $customer->id,
            'order_id' => $order->id,
            'user_id' => $this->technician->id,
            'send_to_technician' => true,
            'status' => 1,
        ]);

        $response = $this->actingAs($this->technician, 'sanctum')
            ->postJson(route('api.technician.schedules.check-in', $schedule), [
                'latitude' => -30.034647,
                'longitude' => -51.217658,
                'observations' => 'Cliente confirmou chegada.',
            ]);

        $response
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('result.status', 2)
            ->assertJsonPath('result.check_in.latitude', '-30.0346470')
            ->assertJsonPath('result.check_in.longitude', '-51.2176580')
            ->assertJsonPath('result.check_in.observations', 'Cliente confirmou chegada.');

        $this->assertDatabaseHas('schedules', [
            'id' => $schedule->id,
            'status' => 2,
            'check_in_latitude' => -30.034647,
            'check_in_longitude' => -51.217658,
            'check_in_observations' => 'Cliente confirmou chegada.',
        ]);
    }

    public function test_technician_registers_check_out_with_gps(): void
    {
        $customer = Customer::factory()->forTenant($this->tenant->id)->create();
        $order = Order::factory()->forTenant($this->tenant->id)->create([
            'customer_id' => $customer->id,
            'user_id' => $this->technician->id,
        ]);
        $schedule = Schedule::factory()->forTenant($this->tenant->id)->create([
            'customer_id' => $customer->id,
            'order_id' => $order->id,
            'user_id' => $this->technician->id,
            'send_to_technician' => true,
            'status' => 2,
        ]);

        $response = $this->actingAs($this->technician, 'sanctum')
            ->postJson(route('api.technician.schedules.check-out', $schedule), [
                'latitude' => -30.035000,
                'longitude' => -51.218000,
                'observations' => 'Atendimento finalizado.',
            ]);

        $response
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('result.status', 3)
            ->assertJsonPath('result.check_out.latitude', '-30.0350000')
            ->assertJsonPath('result.check_out.longitude', '-51.2180000')
            ->assertJsonPath('result.check_out.observations', 'Atendimento finalizado.');

        $this->assertDatabaseHas('schedules', [
            'id' => $schedule->id,
            'status' => 3,
            'check_out_latitude' => -30.035000,
            'check_out_longitude' => -51.218000,
            'check_out_observations' => 'Atendimento finalizado.',
        ]);
    }
}
