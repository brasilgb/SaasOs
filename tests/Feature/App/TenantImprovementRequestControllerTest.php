<?php

namespace Tests\Feature\App;

use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TenantImprovementRequestControllerTest extends TestCase
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

    public function test_it_registers_feedback_with_testimonial_consent(): void
    {
        $response = $this->post(route('app.improvement-requests.feedback.store'), [
            'rating' => 5,
            'comment' => 'O VetorOS agilizou nossa rotina.',
            'allow_testimonial' => true,
            'testimonial_public_name' => 'Anderson',
            'testimonial_public_role' => 'Proprietario',
        ]);

        $response->assertRedirect();

        $this->assertDatabaseHas('tenant_feedbacks', [
            'tenant_id' => $this->tenant->id,
            'feedback_source' => 'app_manual',
            'feedback_status' => 'submitted',
            'feedback_rating' => 5,
            'feedback_comment' => 'O VetorOS agilizou nossa rotina.',
            'feedback_recovery_status' => null,
            'testimonial_status' => 'pending',
            'testimonial_public_name' => 'Anderson',
            'testimonial_public_role' => 'Proprietario',
            'testimonial_excerpt' => 'O VetorOS agilizou nossa rotina.',
        ]);
    }

    public function test_it_registers_low_rating_as_recovery_pending_without_testimonial(): void
    {
        $response = $this->post(route('app.improvement-requests.feedback.store'), [
            'rating' => 3,
            'comment' => 'Precisa melhorar alguns pontos.',
            'allow_testimonial' => true,
        ]);

        $response->assertRedirect();

        $this->assertDatabaseHas('tenant_feedbacks', [
            'tenant_id' => $this->tenant->id,
            'feedback_source' => 'app_manual',
            'feedback_status' => 'submitted',
            'feedback_rating' => 3,
            'feedback_recovery_status' => 'pending',
            'testimonial_status' => null,
            'testimonial_consent_at' => null,
        ]);
    }
}
