<?php

namespace Tests\Feature\App;

use App\Models\App\Equipment;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EquipmentControllerTest extends TestCase
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

    public function test_it_stores_the_equipment_kind(): void
    {
        $response = $this->post(route('app.register-equipments.store'), [
            'equipment' => 'Smartphone',
            'kind' => Equipment::KIND_MOBILE,
            'chart' => true,
        ]);

        $response->assertRedirect(route('app.register-equipments.index'));
        $this->assertDatabaseHas('equipment', [
            'tenant_id' => $this->tenant->id,
            'equipment' => 'Smartphone',
            'kind' => Equipment::KIND_MOBILE,
        ]);
    }

    public function test_it_allows_creating_equipment_without_a_kind(): void
    {
        $response = $this->post(route('app.register-equipments.store'), [
            'equipment' => 'Genérico',
            'chart' => false,
        ]);

        $response->assertSessionHasNoErrors();
        $this->assertDatabaseHas('equipment', [
            'tenant_id' => $this->tenant->id,
            'equipment' => 'Genérico',
            'kind' => null,
        ]);
    }

    public function test_it_rejects_an_invalid_kind(): void
    {
        $response = $this->post(route('app.register-equipments.store'), [
            'equipment' => 'Notebook',
            'kind' => 'not-a-real-kind',
            'chart' => false,
        ]);

        $response->assertSessionHasErrors('kind');
    }

    public function test_it_updates_the_equipment_kind(): void
    {
        $equipment = Equipment::factory()->forTenant($this->tenant->id)->create(['kind' => Equipment::KIND_PC]);

        $response = $this->patch(route('app.register-equipments.update', $equipment), [
            'equipment' => $equipment->equipment,
            'kind' => Equipment::KIND_OTHER,
            'chart' => false,
        ]);

        $response->assertRedirect(route('app.register-equipments.index'));
        $this->assertDatabaseHas('equipment', [
            'id' => $equipment->id,
            'kind' => Equipment::KIND_OTHER,
        ]);
    }
}
