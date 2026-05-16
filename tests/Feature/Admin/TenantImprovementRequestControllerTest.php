<?php

namespace Tests\Feature\Admin;

use App\Mail\TenantImprovementRequestUpdatedMail;
use App\Models\Tenant;
use App\Models\TenantImprovementRequest;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class TenantImprovementRequestControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create([
            'tenant_id' => null,
            'user_number' => null,
            'roles' => User::ROLE_ROOT_APP,
        ]);

        $this->actingAs($this->admin);
    }

    public function test_it_does_not_resend_customer_email_when_only_existing_admin_notes_change(): void
    {
        Mail::fake();

        $tenant = Tenant::factory()->create(['email' => 'cliente@example.test']);
        $user = User::factory()->forTenant($tenant->id)->create(['email' => 'usuario@example.test']);
        $requestItem = TenantImprovementRequest::query()->create([
            'tenant_id' => $tenant->id,
            'user_id' => $user->id,
            'request_type' => 'improvement',
            'status' => 'reviewing',
            'title' => 'Relatorio novo',
            'description' => 'Preciso de um novo relatorio.',
            'admin_notes' => 'Vamos avaliar.',
            'reviewed_at' => now()->subDay(),
        ]);

        $this->patch(route('admin.tenant-improvement-requests.update', $requestItem), [
            'status' => 'reviewing',
            'admin_notes' => 'Vamos avaliar com o time de produto.',
        ])->assertSessionHasNoErrors();

        Mail::assertNotSent(TenantImprovementRequestUpdatedMail::class);
    }

    public function test_it_sends_customer_email_when_status_changes(): void
    {
        Mail::fake();

        $tenant = Tenant::factory()->create(['email' => 'cliente@example.test']);
        $user = User::factory()->forTenant($tenant->id)->create(['email' => 'usuario@example.test']);
        $requestItem = TenantImprovementRequest::query()->create([
            'tenant_id' => $tenant->id,
            'user_id' => $user->id,
            'request_type' => 'improvement',
            'status' => 'new',
            'title' => 'Relatorio novo',
            'description' => 'Preciso de um novo relatorio.',
        ]);

        $this->patch(route('admin.tenant-improvement-requests.update', $requestItem), [
            'status' => 'reviewing',
            'admin_notes' => '',
        ])->assertSessionHasNoErrors();

        Mail::assertSent(TenantImprovementRequestUpdatedMail::class);
    }
}
