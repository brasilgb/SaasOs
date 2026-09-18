<?php

namespace Tests\Feature\App;

use App\Models\App\Customer;
use App\Models\App\CustomerEquipment;
use App\Models\App\Equipment;
use App\Models\App\Order;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CustomerEquipmentControllerTest extends TestCase
{
    use RefreshDatabase;

    private Tenant $tenant;

    private User $user;

    private Customer $customer;

    protected function setUp(): void
    {
        parent::setUp();

        $this->tenant = Tenant::factory()->create();
        $this->user = User::factory()->forTenant($this->tenant->id)->create();
        $this->customer = Customer::factory()->forTenant($this->tenant->id)->create();

        $this->withSession(['tenant_id' => $this->tenant->id])
            ->actingAs($this->user);
    }

    public function test_it_creates_customer_equipment_with_sequential_number_per_tenant(): void
    {
        $response = $this->post(route('app.customers.equipments.store', $this->customer), [
            'brand' => 'Samsung',
            'model' => 'Galaxy S21',
            'serial_number' => 'SN-0001',
            'imei' => '123456789012345',
        ]);

        $response->assertRedirect();

        $this->assertDatabaseHas('customer_equipments', [
            'tenant_id' => $this->tenant->id,
            'customer_id' => $this->customer->id,
            'brand' => 'Samsung',
            'model' => 'Galaxy S21',
            'customer_equipment_number' => 1,
        ]);

        $second = CustomerEquipment::factory()->forTenant($this->tenant->id)->create([
            'customer_id' => $this->customer->id,
        ]);

        $this->assertSame(2, $second->customer_equipment_number);
    }

    public function test_it_isolates_customer_equipment_between_tenants(): void
    {
        $otherTenant = Tenant::factory()->create();
        $otherUser = User::factory()->forTenant($otherTenant->id)->create();
        $otherCustomer = Customer::factory()->forTenant($otherTenant->id)->create();
        $otherEquipment = CustomerEquipment::factory()->forTenant($otherTenant->id)->create([
            'customer_id' => $otherCustomer->id,
        ]);

        $this->withSession(['tenant_id' => $this->tenant->id])
            ->actingAs($this->user);

        // A app converte 404 em rotas não-GET num redirect com flash "error" (ver bootstrap/app.php),
        // então o binding cross-tenant nunca deve resultar em sucesso (redirect sem essa flash).
        $originalBrand = $otherEquipment->brand;

        $this->patch(route('app.customer-equipments.update', $otherEquipment), ['brand' => 'Hacked'])
            ->assertSessionHas('error');

        $this->delete(route('app.customer-equipments.destroy', $otherEquipment))
            ->assertSessionHas('error');

        $this->assertDatabaseHas('customer_equipments', [
            'id' => $otherEquipment->id,
            'brand' => $originalBrand,
        ]);

        // sanity check: same-tenant user can act on it fine.
        $this->withSession(['tenant_id' => $otherTenant->id])
            ->actingAs($otherUser)
            ->patch(route('app.customer-equipments.update', $otherEquipment), ['brand' => 'Novo Nome'])
            ->assertRedirect();
    }

    public function test_it_blocks_deletion_when_linked_to_orders(): void
    {
        $equipmentType = Equipment::factory()->forTenant($this->tenant->id)->create();
        $customerEquipment = CustomerEquipment::factory()->forTenant($this->tenant->id)->create([
            'customer_id' => $this->customer->id,
        ]);

        Order::factory()->forTenant($this->tenant->id)->create([
            'customer_id' => $this->customer->id,
            'equipment_id' => $equipmentType->id,
            'customer_equipment_id' => $customerEquipment->id,
        ]);

        $response = $this->delete(route('app.customer-equipments.destroy', $customerEquipment));

        $response->assertSessionHas('error');
        $this->assertDatabaseHas('customer_equipments', ['id' => $customerEquipment->id]);
    }

    public function test_it_normalizes_imei_and_rejects_invalid_length(): void
    {
        $response = $this->post(route('app.customers.equipments.store', $this->customer), [
            'brand' => 'Apple',
            'imei' => '123.456.789-012.345',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('customer_equipments', [
            'customer_id' => $this->customer->id,
            'imei' => '123456789012345',
        ]);

        $invalid = $this->post(route('app.customers.equipments.store', $this->customer), [
            'brand' => 'Apple',
            'imei' => '123',
        ]);

        $invalid->assertSessionHasErrors('imei');
    }

    public function test_it_allows_optional_serial_number(): void
    {
        $response = $this->post(route('app.customers.equipments.store', $this->customer), [
            'brand' => 'Generico',
        ]);

        $response->assertSessionHasNoErrors();
        $this->assertDatabaseHas('customer_equipments', [
            'customer_id' => $this->customer->id,
            'brand' => 'Generico',
            'serial_number' => null,
        ]);
    }

    public function test_search_only_returns_equipment_for_the_given_customer(): void
    {
        $otherCustomer = Customer::factory()->forTenant($this->tenant->id)->create();

        $mine = CustomerEquipment::factory()->forTenant($this->tenant->id)->create([
            'customer_id' => $this->customer->id,
            'brand' => 'Meu Aparelho',
        ]);
        CustomerEquipment::factory()->forTenant($this->tenant->id)->create([
            'customer_id' => $otherCustomer->id,
            'brand' => 'Aparelho de Outro Cliente',
        ]);

        $response = $this->getJson(route('app.customer-equipments.search', ['customer_id' => $this->customer->id]));

        $response->assertOk();
        $ids = collect($response->json())->pluck('id')->all();

        $this->assertSame([$mine->id], $ids);
    }

    public function test_search_and_store_expose_the_linked_equipment_type(): void
    {
        $equipmentType = Equipment::factory()->forTenant($this->tenant->id)->create();

        $storeResponse = $this->post(route('app.customers.equipments.store', $this->customer), [
            'equipment_id' => $equipmentType->id,
            'brand' => 'Apple',
            'model' => 'iPhone',
            '_inline' => true,
        ]);

        $storeResponse->assertSessionHas('customer_equipment_saved.equipment_id', $equipmentType->id);

        $searchResponse = $this->getJson(route('app.customer-equipments.search', ['customer_id' => $this->customer->id]));
        $searchResponse->assertOk();

        $this->assertSame($equipmentType->id, collect($searchResponse->json())->first()['equipment_id']);
    }

    public function test_creating_order_with_customer_equipment_from_another_customer_is_rejected(): void
    {
        $equipmentType = Equipment::factory()->forTenant($this->tenant->id)->create();
        $otherCustomer = Customer::factory()->forTenant($this->tenant->id)->create();
        $otherCustomerEquipment = CustomerEquipment::factory()->forTenant($this->tenant->id)->create([
            'customer_id' => $otherCustomer->id,
        ]);

        $response = $this->post(route('app.orders.store'), [
            'customer_id' => $this->customer->id,
            'equipment_id' => $equipmentType->id,
            'customer_equipment_id' => $otherCustomerEquipment->id,
            'model' => 'Notebook',
            'defect' => 'Nao liga',
            'service_status' => 1,
            'delivery_forecast' => now()->addDays(7)->toDateString(),
        ]);

        $response->assertSessionHasErrors('customer_equipment_id');
        $this->assertDatabaseMissing('orders', ['customer_equipment_id' => $otherCustomerEquipment->id]);
    }
}
