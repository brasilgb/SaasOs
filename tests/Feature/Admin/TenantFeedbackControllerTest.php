<?php

namespace Tests\Feature\Admin;

use App\Models\Tenant;
use App\Models\TenantFeedback;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TenantFeedbackControllerTest extends TestCase
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

    public function test_it_does_not_publish_testimonial_without_customer_consent(): void
    {
        $feedback = TenantFeedback::query()->create([
            'tenant_id' => Tenant::factory()->create()->id,
            'feedback_token' => (string) str()->uuid(),
            'feedback_source' => 'onboarding_7d',
            'feedback_status' => 'submitted',
            'feedback_rating' => 5,
            'feedback_comment' => 'Gostei do sistema.',
            'feedback_submitted_at' => now(),
        ]);

        $response = $this->patch(route('admin.tenant-feedbacks.update', $feedback), [
            'testimonial_status' => 'published',
            'testimonial_excerpt' => 'Gostei do sistema.',
        ]);

        $response->assertSessionHasErrors('testimonial_status');

        $this->assertDatabaseHas('tenant_feedbacks', [
            'id' => $feedback->id,
            'testimonial_status' => null,
            'testimonial_published_at' => null,
        ]);
    }

    public function test_it_preserves_existing_testimonial_publication_date(): void
    {
        $publishedAt = now()->subDays(2);
        $feedback = TenantFeedback::query()->create([
            'tenant_id' => Tenant::factory()->create()->id,
            'feedback_token' => (string) str()->uuid(),
            'feedback_source' => 'onboarding_7d',
            'feedback_status' => 'submitted',
            'feedback_rating' => 5,
            'feedback_comment' => 'Gostei do sistema.',
            'feedback_submitted_at' => now()->subDays(3),
            'testimonial_consent_at' => now()->subDays(3),
            'testimonial_status' => 'published',
            'testimonial_excerpt' => 'Gostei do sistema.',
            'testimonial_published_at' => $publishedAt,
        ]);

        $this->patch(route('admin.tenant-feedbacks.update', $feedback), [
            'testimonial_status' => 'published',
            'testimonial_excerpt' => 'Gostei muito do sistema.',
        ])->assertSessionHasNoErrors();

        $feedback->refresh();

        $this->assertSame('Gostei muito do sistema.', $feedback->testimonial_excerpt);
        $this->assertSame(
            $publishedAt->format('Y-m-d H:i:s'),
            $feedback->testimonial_published_at->format('Y-m-d H:i:s')
        );
    }
}
