<?php

namespace Tests\Feature\App;

use App\Models\App\Other;
use App\Models\Tenant;
use App\Models\User;
use App\Support\Pagination;
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

    public function test_it_updates_records_per_page(): void
    {
        $other = Other::query()->create();

        $response = $this->put(route('app.other-settings.update', $other), [
            'records_per_page' => 35,
        ]);

        $response->assertRedirect(route('app.other-settings.index', ['other' => $other->id]));

        $this->assertDatabaseHas('others', [
            'id' => $other->id,
            'records_per_page' => 35,
        ]);
        $this->assertSame(35, Other::recordsPerPage($this->tenant->id));
        $this->assertSame(35, Pagination::perPage());
    }

    public function test_records_per_page_uses_twenty_as_default(): void
    {
        $this->assertSame(20, Other::recordsPerPage($this->tenant->id));
    }

    public function test_it_rejects_an_unsupported_records_per_page_value(): void
    {
        $other = Other::query()->create();

        $this->from(route('app.other-settings.index'))
            ->put(route('app.other-settings.update', $other), [
                'records_per_page' => 999,
            ])
            ->assertRedirect(route('app.other-settings.index'))
            ->assertSessionHasErrors('records_per_page');

        $this->assertSame(20, $other->fresh()->records_per_page);
    }
}
