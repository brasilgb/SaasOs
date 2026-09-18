<?php

namespace Tests\Feature\App;

use App\Models\App\WhatsappConnection;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class WhatsappConnectionControllerTest extends TestCase
{
    use RefreshDatabase;

    private Tenant $tenant;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();

        config(['services.waha.base_url' => 'http://waha.test']);

        $this->tenant = Tenant::factory()->create();
        $this->user = User::factory()->forTenant($this->tenant->id)->create();

        $this->withSession(['tenant_id' => $this->tenant->id])
            ->actingAs($this->user);
    }

    public function test_connect_creates_local_connection_and_starts_waha_session(): void
    {
        Http::fake([
            'waha.test/api/sessions' => Http::response(['name' => "vetoros1-{$this->tenant->id}", 'status' => 'STARTING']),
        ]);

        $response = $this->post(route('app.whatsapp-connection.connect'));

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('whatsapp_connections', [
            'tenant_id' => $this->tenant->id,
            'session_name' => "vetoros1-{$this->tenant->id}",
            'status' => WhatsappConnection::STATUS_STARTING,
        ]);

        Http::assertSent(fn ($request) => $request->url() === 'http://waha.test/api/sessions' && $request->method() === 'POST');
    }

    public function test_status_syncs_from_waha_and_marks_connected(): void
    {
        WhatsappConnection::factory()->for($this->tenant)->create([
            'session_name' => "vetoros1-{$this->tenant->id}",
            'status' => WhatsappConnection::STATUS_STARTING,
        ]);

        Http::fake([
            "waha.test/api/sessions/vetoros1-{$this->tenant->id}" => Http::response([
                'status' => 'WORKING',
                'me' => ['id' => '5551999999999@c.us'],
            ]),
        ]);

        $response = $this->getJson(route('app.whatsapp-connection.status'));

        $response->assertOk();
        $response->assertJson(['status' => 'connected', 'phone_number' => '5551999999999']);

        $this->assertDatabaseHas('whatsapp_connections', [
            'tenant_id' => $this->tenant->id,
            'status' => WhatsappConnection::STATUS_CONNECTED,
            'phone_number' => '5551999999999',
        ]);
    }

    public function test_status_keeps_last_known_state_when_waha_is_unavailable(): void
    {
        WhatsappConnection::factory()->for($this->tenant)->create([
            'session_name' => "vetoros1-{$this->tenant->id}",
            'status' => WhatsappConnection::STATUS_CONNECTED,
            'phone_number' => '5551999999999',
        ]);

        Http::fake([
            "waha.test/api/sessions/vetoros1-{$this->tenant->id}" => Http::response([], 500),
        ]);

        $response = $this->getJson(route('app.whatsapp-connection.status'));

        $response->assertOk();
        $response->assertJson(['status' => 'connected', 'phone_number' => '5551999999999']);
    }

    public function test_qr_code_returns_image_from_waha(): void
    {
        WhatsappConnection::factory()->for($this->tenant)->create([
            'session_name' => "vetoros1-{$this->tenant->id}",
            'status' => WhatsappConnection::STATUS_QR_REQUIRED,
        ]);

        Http::fake([
            "waha.test/api/vetoros1-{$this->tenant->id}/auth/qr*" => Http::response('binary-png-data', 200, ['Content-Type' => 'image/png']),
        ]);

        $response = $this->get(route('app.whatsapp-connection.qr'));

        $response->assertOk();
        $response->assertHeader('Content-Type', 'image/png');
        $this->assertSame('binary-png-data', $response->getContent());
    }

    public function test_qr_code_returns_friendly_error_when_waha_unavailable(): void
    {
        WhatsappConnection::factory()->for($this->tenant)->create([
            'session_name' => "vetoros1-{$this->tenant->id}",
        ]);

        Http::fake([
            "waha.test/api/vetoros1-{$this->tenant->id}/auth/qr*" => Http::response([], 500),
        ]);

        $response = $this->get(route('app.whatsapp-connection.qr'));

        $response->assertStatus(503);
    }

    public function test_disconnect_logs_out_waha_session_and_updates_local_status(): void
    {
        WhatsappConnection::factory()->for($this->tenant)->create([
            'session_name' => "vetoros1-{$this->tenant->id}",
            'status' => WhatsappConnection::STATUS_CONNECTED,
        ]);

        Http::fake([
            "waha.test/api/sessions/vetoros1-{$this->tenant->id}/logout" => Http::response(['success' => true]),
        ]);

        $response = $this->post(route('app.whatsapp-connection.disconnect'));

        $response->assertRedirect();
        $this->assertDatabaseHas('whatsapp_connections', [
            'tenant_id' => $this->tenant->id,
            'status' => WhatsappConnection::STATUS_DISCONNECTED,
        ]);
    }

    public function test_tenant_isolation_each_tenant_gets_its_own_connection(): void
    {
        $otherTenant = Tenant::factory()->create();
        WhatsappConnection::factory()->for($otherTenant)->create([
            'session_name' => "vetoros1-{$otherTenant->id}",
            'status' => WhatsappConnection::STATUS_CONNECTED,
            'phone_number' => '5551888888888',
        ]);

        Http::fake([
            "waha.test/api/sessions/vetoros1-{$this->tenant->id}" => Http::response(['status' => 'STOPPED']),
        ]);

        $response = $this->getJson(route('app.whatsapp-connection.status'));

        $response->assertOk();
        $response->assertJson(['status' => 'disconnected']);

        $this->assertDatabaseHas('whatsapp_connections', [
            'tenant_id' => $this->tenant->id,
            'session_name' => "vetoros1-{$this->tenant->id}",
        ]);
        $this->assertDatabaseMissing('whatsapp_connections', [
            'tenant_id' => $this->tenant->id,
            'phone_number' => '5551888888888',
        ]);
    }
}
