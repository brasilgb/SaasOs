<?php

namespace Tests\Feature\App;

use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserTenantIsolationTest extends TestCase
{
    use RefreshDatabase;

    public function test_app_user_index_only_lists_current_tenant_users(): void
    {
        $tenant = Tenant::factory()->create();
        $otherTenant = Tenant::factory()->create();

        $actor = User::factory()->forTenant($tenant->id)->create(['roles' => User::ROLE_ADMIN]);
        $sameTenantUser = User::factory()->forTenant($tenant->id)->create(['roles' => User::ROLE_TECHNICIAN]);
        $otherTenantUser = User::factory()->forTenant($otherTenant->id)->create(['roles' => User::ROLE_TECHNICIAN]);
        $rootUser = User::factory()->create([
            'tenant_id' => null,
            'roles' => User::ROLE_ROOT_SYSTEM,
        ]);

        $response = $this->withSession(['tenant_id' => $tenant->id])
            ->actingAs($actor)
            ->get(route('app.users.index'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('app/users/index')
            ->where('users.data.0.id', $sameTenantUser->id)
            ->where('users.data.1.id', $actor->id)
        );

        $payload = $response->viewData('page')['props']['users']['data'];
        $ids = collect($payload)->pluck('id');

        $this->assertTrue($ids->contains($sameTenantUser->id));
        $this->assertTrue($ids->contains($actor->id));
        $this->assertFalse($ids->contains($otherTenantUser->id));
        $this->assertFalse($ids->contains($rootUser->id));
    }

    public function test_app_user_routes_do_not_bind_users_from_another_tenant(): void
    {
        $tenant = Tenant::factory()->create();
        $otherTenant = Tenant::factory()->create();

        $actor = User::factory()->forTenant($tenant->id)->create(['roles' => User::ROLE_ADMIN]);
        $otherTenantUser = User::factory()->forTenant($otherTenant->id)->create(['roles' => User::ROLE_TECHNICIAN]);

        $this->withSession(['tenant_id' => $tenant->id])
            ->actingAs($actor)
            ->get(route('app.users.show', $otherTenantUser))
            ->assertNotFound();
    }

    public function test_app_user_store_forces_current_tenant_id(): void
    {
        $tenant = Tenant::factory()->create();
        $otherTenant = Tenant::factory()->create();

        $actor = User::factory()->forTenant($tenant->id)->create(['roles' => User::ROLE_ADMIN]);

        $this->withSession(['tenant_id' => $tenant->id])
            ->actingAs($actor)
            ->post(route('app.users.store'), [
                'name' => 'Tenant Scoped User',
                'email' => 'tenant-scoped@example.com',
                'tenant_id' => $otherTenant->id,
                'roles' => User::ROLE_OPERATOR,
                'password' => 'password',
                'password_confirmation' => 'password',
            ])
            ->assertRedirect(route('app.users.index'));

        $created = User::withoutGlobalScopes()
            ->where('email', 'tenant-scoped@example.com')
            ->firstOrFail();

        $this->assertSame($tenant->id, (int) $created->tenant_id);
    }
}
