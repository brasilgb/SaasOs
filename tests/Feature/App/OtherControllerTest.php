<?php

namespace Tests\Feature\App;

use App\Models\App\Other;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OtherControllerTest extends TestCase
{
    use RefreshDatabase;

    private Tenant $tenant;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();

        $this->tenant = Tenant::factory()->create(['name' => 'Test Tenant']);
        $this->user = User::factory()->forTenant($this->tenant->id)->create();

        $this->withSession(['tenant_id' => $this->tenant->id])
            ->actingAs($this->user);
    }

    public function test_other_settings_index_exposes_business_metrics_defaults(): void
    {
        $response = $this->get(route('app.other-settings.index'));

        $response
            ->assertOk()
            ->assertViewHas('page.props.businessMetrics.warranty_return_alert_threshold', 10)
            ->assertViewHas('page.props.businessMetrics.communication_follow_up_cooldown_days', 2);
    }

    public function test_it_updates_warranty_return_alert_threshold(): void
    {
        $other = Other::query()->create();

        $response = $this->put(route('app.other-settings.update', $other), [
            'enablesales' => true,
            'warranty_return_alert_threshold' => 7.5,
            'communication_follow_up_cooldown_days' => 4,
        ]);

        $response->assertRedirect(route('app.other-settings.index', ['other' => $other->id]));

        $this->assertDatabaseHas('others', [
            'id' => $other->id,
            'warranty_return_alert_threshold' => 7.5,
            'communication_follow_up_cooldown_days' => 4,
        ]);
    }
}
