<?php

namespace Tests\Feature\App;

use App\Models\App\Budget;
use App\Models\App\Company;
use App\Models\App\Customer;
use App\Models\App\Equipment;
use App\Models\App\Order;
use App\Models\Tenant;
use App\Models\User;
use App\Support\OrderStatus;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ApiMobileControllerTest extends TestCase
{
    use RefreshDatabase;

    private Tenant $tenant;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();

        $this->tenant = Tenant::factory()->create();
        $this->user = User::factory()->forTenant($this->tenant->id)->create();
    }

    public function test_login_returns_company_name_and_logo(): void
    {
        Company::factory()->forTenant($this->tenant->id)->create([
            'shortname' => 'Vetor Assistencia',
            'companyname' => 'Vetor Assistencia Tecnica Ltda',
            'logo' => 'vetor-logo.png',
        ]);

        $response = $this->postJson(route('loginuser'), [
            'email' => $this->user->email,
            'password' => 'password',
        ]);

        $response
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('result.id', $this->user->id)
            ->assertJsonPath('company.name', 'Vetor Assistencia')
            ->assertJsonPath('company.logo', 'vetor-logo.png')
            ->assertJsonPath('company.logo_url', asset('storage/logos/vetor-logo.png'));
    }

    public function test_it_filters_mobile_budgets_by_equipment_model_and_service(): void
    {
        $notebook = Equipment::factory()->forTenant($this->tenant->id)->create([
            'equipment' => 'Notebook',
        ]);
        $desktop = Equipment::factory()->forTenant($this->tenant->id)->create([
            'equipment' => 'Desktop',
        ]);

        $matched = Budget::factory()->forTenant($this->tenant->id)->create([
            'equipment_id' => $notebook->id,
            'model' => 'Dell Inspiron',
            'service' => 'Troca de tela',
            'description' => 'Substituicao completa da tela',
            'total_value' => 450,
        ]);
        Budget::factory()->forTenant($this->tenant->id)->create([
            'equipment_id' => $notebook->id,
            'model' => 'Dell Inspiron',
            'service' => 'Limpeza interna',
        ]);
        Budget::factory()->forTenant($this->tenant->id)->create([
            'equipment_id' => $desktop->id,
            'model' => 'Dell Inspiron',
            'service' => 'Troca de tela',
        ]);

        $filters = $this->actingAs($this->user, 'sanctum')->getJson(route('api.budgets.filters'));

        $filters
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonFragment(['id' => $notebook->id, 'equipment' => 'Notebook'])
            ->assertJsonFragment(['id' => $desktop->id, 'equipment' => 'Desktop']);

        $models = $this->actingAs($this->user, 'sanctum')->getJson(route('api.budgets.models', [
            'equipment_id' => $notebook->id,
        ]));

        $models
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('result.models.0', 'Dell Inspiron');

        $services = $this->actingAs($this->user, 'sanctum')->getJson(route('api.budgets.services', [
            'equipment_id' => $notebook->id,
            'model' => 'Dell Inspiron',
        ]));

        $services
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('result.services.0', 'Limpeza interna')
            ->assertJsonPath('result.services.1', 'Troca de tela');

        $response = $this->actingAs($this->user, 'sanctum')->getJson(route('api.budgets.show', [
            'equipment_id' => $notebook->id,
            'model' => 'Dell Inspiron',
            'service' => 'Troca de tela',
        ]));

        $response
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('result.budgets.0.id', $matched->id)
            ->assertJsonPath('result.budgets.0.equipment.equipment', 'Notebook')
            ->assertJsonPath('result.budgets.0.model', 'Dell Inspiron')
            ->assertJsonPath('result.budgets.0.service', 'Troca de tela')
            ->assertJsonPath('result.budgets.0.description', 'Substituicao completa da tela');
    }

    public function test_it_pre_registers_customer_from_api(): void
    {
        $response = $this->actingAs($this->user, 'sanctum')->postJson(route('api.customers.pre-register'), [
            'name' => 'Cliente API',
            'phone' => '51999990000',
            'cpfcnpj' => '12345678900',
            'email' => 'cliente-api@example.test',
        ]);

        $response
            ->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('result.name', 'Cliente API')
            ->assertJsonPath('result.customer_number', 1);

        $this->assertDatabaseHas('customers', [
            'tenant_id' => $this->tenant->id,
            'customer_number' => 1,
            'name' => 'Cliente API',
            'cpfcnpj' => '12345678900',
        ]);
    }

    public function test_it_lists_equipment_report_filters_from_api(): void
    {
        $customer = Customer::factory()->forTenant($this->tenant->id)->create();
        $notebook = Equipment::factory()->forTenant($this->tenant->id)->create(['equipment' => 'Notebook']);
        $desktop = Equipment::factory()->forTenant($this->tenant->id)->create(['equipment' => 'Desktop']);

        Order::factory()->forTenant($this->tenant->id)->create([
            'customer_id' => $customer->id,
            'equipment_id' => $notebook->id,
            'user_id' => $this->user->id,
            'model' => 'Dell Inspiron',
        ]);

        Order::factory()->forTenant($this->tenant->id)->create([
            'customer_id' => $customer->id,
            'equipment_id' => $desktop->id,
            'user_id' => $this->user->id,
            'model' => 'HP ProDesk',
        ]);

        $response = $this->actingAs($this->user, 'sanctum')->getJson(route('api.reports.equipment-filters'));

        $response
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonFragment(['equipment' => 'Notebook'])
            ->assertJsonFragment(['equipment' => 'Desktop'])
            ->assertJsonPath("result.models_by_equipment.{$notebook->id}.0", 'Dell Inspiron')
            ->assertJsonPath("result.models_by_equipment.{$desktop->id}.0", 'HP ProDesk');
    }

    public function test_it_filters_equipment_report_by_equipment_and_model(): void
    {
        $customer = Customer::factory()->forTenant($this->tenant->id)->create();
        $notebook = Equipment::factory()->forTenant($this->tenant->id)->create(['equipment' => 'Notebook']);
        $desktop = Equipment::factory()->forTenant($this->tenant->id)->create(['equipment' => 'Desktop']);

        $matched = Order::factory()->forTenant($this->tenant->id)->create([
            'customer_id' => $customer->id,
            'equipment_id' => $notebook->id,
            'user_id' => $this->user->id,
            'model' => 'Dell Inspiron',
            'service_status' => OrderStatus::DELIVERED,
            'service_cost' => 300,
            'budget_value' => 300,
        ]);

        Order::factory()->forTenant($this->tenant->id)->create([
            'customer_id' => $customer->id,
            'equipment_id' => $notebook->id,
            'user_id' => $this->user->id,
            'model' => 'Lenovo Ideapad',
            'service_cost' => 150,
        ]);

        Order::factory()->forTenant($this->tenant->id)->create([
            'customer_id' => $customer->id,
            'equipment_id' => $desktop->id,
            'user_id' => $this->user->id,
            'model' => 'Dell Inspiron',
            'service_cost' => 200,
        ]);

        $response = $this->actingAs($this->user, 'sanctum')->getJson(route('api.reports.equipment', [
            'equipment_id' => $notebook->id,
            'model' => 'Dell Inspiron',
        ]));

        $response
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('result.summary.orders_count', 1)
            ->assertJsonPath('result.summary.service_cost_total', 300)
            ->assertJsonPath('result.orders.data.0.id', $matched->id)
            ->assertJsonPath('result.orders.data.0.service_status_label', 'Entregue ao cliente');
    }
}
