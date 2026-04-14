<?php

namespace Tests\Feature\App;

use App\Models\App\Customer;
use App\Models\App\Equipment;
use App\Models\App\Image;
use App\Models\App\Order;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class PermissionsTest extends TestCase
{
    use RefreshDatabase;

    private Tenant $tenant;

    private User $technician;

    private User $otherTechnician;

    private User $operator;

    protected function setUp(): void
    {
        parent::setUp();

        $this->tenant = Tenant::factory()->create();
        $this->technician = User::factory()->forTenant($this->tenant->id)->create([
            'roles' => User::ROLE_TECHNICIAN,
        ]);
        $this->otherTechnician = User::factory()->forTenant($this->tenant->id)->create([
            'roles' => User::ROLE_TECHNICIAN,
        ]);
        $this->operator = User::factory()->forTenant($this->tenant->id)->create([
            'roles' => User::ROLE_OPERATOR,
        ]);

        DB::table('others')->insert([
            'tenant_id' => $this->tenant->id,
            'navigation' => false,
            'enableparts' => false,
            'enablesales' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function test_technician_can_only_access_images_from_owned_orders(): void
    {
        $customer = Customer::factory()->forTenant($this->tenant->id)->create();
        $equipment = Equipment::factory()->forTenant($this->tenant->id)->create();

        $ownedOrder = Order::factory()->forTenant($this->tenant->id)->create([
            'customer_id' => $customer->id,
            'equipment_id' => $equipment->id,
            'user_id' => $this->technician->id,
        ]);

        $foreignOrder = Order::factory()->forTenant($this->tenant->id)->create([
            'customer_id' => $customer->id,
            'equipment_id' => $equipment->id,
            'user_id' => $this->otherTechnician->id,
        ]);

        Image::factory()->forTenant($this->tenant->id)->create(['order_id' => $ownedOrder->id]);
        Image::factory()->forTenant($this->tenant->id)->create(['order_id' => $foreignOrder->id]);

        $this->withSession(['tenant_id' => $this->tenant->id])
            ->actingAs($this->technician);

        $this->get(route('app.images.index', ['or' => $ownedOrder->id]))
            ->assertOk();

        $this->get(route('app.images.index', ['or' => $foreignOrder->id]))
            ->assertForbidden();
    }

    public function test_technician_cannot_access_receipts_whatsapp_labels_sales_cashier_or_expenses(): void
    {
        $customer = Customer::factory()->forTenant($this->tenant->id)->create();
        $equipment = Equipment::factory()->forTenant($this->tenant->id)->create();
        $order = Order::factory()->forTenant($this->tenant->id)->create([
            'customer_id' => $customer->id,
            'equipment_id' => $equipment->id,
            'user_id' => $this->technician->id,
        ]);

        $this->withSession(['tenant_id' => $this->tenant->id])
            ->actingAs($this->technician);

        $this->get(route('app.receipts.printing', ['or' => $order->id, 'tp' => 'receivingequipment']))
            ->assertForbidden();

        $this->get(route('app.whatsapp-message.index'))
            ->assertForbidden();

        $this->get(route('app.label-printing.index'))
            ->assertForbidden();

        $this->get(route('app.sales.index'))
            ->assertRedirect(route('app.dashboard'));

        $this->get(route('app.cashier.index'))
            ->assertRedirect(route('app.dashboard'));

        $this->get(route('app.expenses.index'))
            ->assertRedirect(route('app.dashboard'));
    }

    public function test_operator_can_access_sales_cashier_expenses_receipts_whatsapp_and_labels_when_enabled(): void
    {
        $customer = Customer::factory()->forTenant($this->tenant->id)->create();
        $equipment = Equipment::factory()->forTenant($this->tenant->id)->create();
        $order = Order::factory()->forTenant($this->tenant->id)->create([
            'customer_id' => $customer->id,
            'equipment_id' => $equipment->id,
            'user_id' => null,
        ]);

        $this->withSession(['tenant_id' => $this->tenant->id])
            ->actingAs($this->operator);

        $this->get(route('app.sales.index'))
            ->assertOk();

        $this->get(route('app.cashier.index'))
            ->assertOk();

        $this->get(route('app.expenses.index'))
            ->assertOk();

        $this->get(route('app.receipts.printing', ['or' => $order->id, 'tp' => 'receivingequipment']))
            ->assertOk();

        $this->get(route('app.whatsapp-message.index'))
            ->assertOk();

        $this->get(route('app.label-printing.index'))
            ->assertOk();
    }
}
