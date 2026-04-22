<?php

namespace Tests\Feature\App;

use App\Models\Admin\Plan;
use App\Models\Admin\Period;
use App\Models\App\Payment;
use App\Models\Tenant;
use App\Services\MercadoPagoService;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Mockery;
use Tests\TestCase;

class WebhookControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function tearDown(): void
    {
        Mockery::close();

        parent::tearDown();
    }

    public function test_it_rejects_webhook_with_invalid_token(): void
    {
        config()->set('services.mercadopago.webhook_token', 'expected-token');

        $response = $this->postJson(route('webhook.mercadopago', ['token' => 'invalid-token']), [
            'type' => 'payment',
            'data' => ['id' => 'mp-123'],
        ]);

        $response
            ->assertStatus(403)
            ->assertJson([
                'error' => 'Unauthorized',
            ]);
    }

    public function test_it_renews_tenant_and_stores_payment_when_webhook_payment_is_approved(): void
    {
        config()->set('services.mercadopago.token', 'mp-test-token');
        config()->set('services.mercadopago.webhook_token', 'expected-token');

        $plan = Plan::factory()->create([
            'name' => 'Plano Trimestral',
            'slug' => 'plano-trimestral',
            'value' => 299.90,
            'billing_months' => 3,
        ]);

        $period = Period::factory()->create([
            'plan_id' => $plan->id,
            'name' => 'Trimestral',
            'interval' => 'month',
            'interval_count' => 3,
            'price' => 299.90,
        ]);

        $currentExpiration = Carbon::now()->addDays(10)->startOfMinute();
        $tenant = Tenant::factory()->create([
            'plan_id' => null,
            'period_id' => null,
            'subscription_status' => 'blocked',
            'expires_at' => $currentExpiration,
            'last_payment_id' => null,
            'status' => 0,
        ]);

        $fakePayment = (object) [
            'id' => 'mp-approved-1',
            'status' => 'approved',
            'transaction_amount' => 299.90,
            'date_of_expiration' => now()->addDay()->toIso8601String(),
            'external_reference' => json_encode([
                'tenant_id' => $tenant->id,
                'plan_id' => $plan->id,
            ]),
        ];

        $service = Mockery::mock(MercadoPagoService::class);
        $service->shouldReceive('getPayment')
            ->once()
            ->with('mp-approved-1')
            ->andReturn($fakePayment);
        $this->app->instance(MercadoPagoService::class, $service);

        $response = $this->postJson(route('webhook.mercadopago', ['token' => 'expected-token']), [
            'type' => 'payment',
            'data' => ['id' => 'mp-approved-1'],
        ]);

        $response
            ->assertOk()
            ->assertJson([
                'status' => 'success',
            ]);

        $tenant->refresh();

        $this->assertSame($plan->id, $tenant->plan_id);
        $this->assertSame($period->id, $tenant->period_id);
        $this->assertSame('active', $tenant->subscription_status);
        $this->assertSame('mp-approved-1', $tenant->last_payment_id);
        $this->assertSame(1, (int) $tenant->status);
        $this->assertTrue($tenant->expires_at->equalTo($currentExpiration->copy()->addMonths(3)));

        $this->assertDatabaseHas('payments', [
            'tenant_id' => $tenant->id,
            'payment_id' => 'mp-approved-1',
            'gateway' => 'mercadopago',
            'status' => 'approved',
        ]);
    }

    public function test_it_syncs_pending_payment_without_renewing_tenant(): void
    {
        config()->set('services.mercadopago.token', 'mp-test-token');
        config()->set('services.mercadopago.webhook_token', 'expected-token');

        $plan = Plan::factory()->create([
            'name' => 'Plano Mensal',
            'slug' => 'plano-mensal',
            'value' => 99.90,
            'billing_months' => 1,
        ]);

        $tenant = Tenant::factory()->create([
            'subscription_status' => 'blocked',
            'last_payment_id' => null,
        ]);

        $originalExpiration = $tenant->expires_at?->copy();

        $fakePayment = (object) [
            'id' => 'mp-pending-1',
            'status' => 'pending',
            'transaction_amount' => 99.90,
            'date_of_expiration' => now()->addDay()->toIso8601String(),
            'external_reference' => json_encode([
                'tenant_id' => $tenant->id,
                'plan_id' => $plan->id,
            ]),
        ];

        $service = Mockery::mock(MercadoPagoService::class);
        $service->shouldReceive('getPayment')
            ->once()
            ->with('mp-pending-1')
            ->andReturn($fakePayment);
        $this->app->instance(MercadoPagoService::class, $service);

        $response = $this->postJson(route('webhook.mercadopago', ['token' => 'expected-token']), [
            'type' => 'payment',
            'data' => ['id' => 'mp-pending-1'],
        ]);

        $response
            ->assertOk()
            ->assertJson([
                'status' => 'processed_not_approved',
            ]);

        $tenant->refresh();

        $this->assertSame('blocked', $tenant->subscription_status);
        $this->assertNull($tenant->last_payment_id);
        $this->assertTrue(optional($tenant->expires_at)->equalTo($originalExpiration));

        $this->assertDatabaseHas('payments', [
            'tenant_id' => $tenant->id,
            'payment_id' => 'mp-pending-1',
            'status' => 'pending',
        ]);
    }

    public function test_it_does_not_extend_twice_when_same_payment_is_received_again(): void
    {
        config()->set('services.mercadopago.token', 'mp-test-token');
        config()->set('services.mercadopago.webhook_token', 'expected-token');

        $plan = Plan::factory()->create([
            'name' => 'Plano Mensal',
            'slug' => 'plano-mensal',
            'value' => 99.90,
            'billing_months' => 1,
        ]);

        $period = Period::factory()->create([
            'plan_id' => $plan->id,
            'name' => 'Mensal',
            'interval' => 'month',
            'interval_count' => 1,
            'price' => 99.90,
        ]);

        $initialExpiration = Carbon::now()->addDays(5)->startOfMinute();
        $tenant = Tenant::factory()->create([
            'plan_id' => $plan->id,
            'period_id' => $period->id,
            'subscription_status' => 'active',
            'expires_at' => $initialExpiration,
            'last_payment_id' => null,
        ]);

        $fakePayment = (object) [
            'id' => 'mp-repeat-1',
            'status' => 'approved',
            'transaction_amount' => 99.90,
            'date_of_expiration' => now()->addDay()->toIso8601String(),
            'external_reference' => json_encode([
                'tenant_id' => $tenant->id,
                'plan_id' => $plan->id,
            ]),
        ];

        $service = Mockery::mock(MercadoPagoService::class);
        $service->shouldReceive('getPayment')
            ->twice()
            ->with('mp-repeat-1')
            ->andReturn($fakePayment);
        $this->app->instance(MercadoPagoService::class, $service);

        $payload = [
            'type' => 'payment',
            'data' => ['id' => 'mp-repeat-1'],
        ];

        $this->postJson(route('webhook.mercadopago', ['token' => 'expected-token']), $payload)->assertOk();
        $firstExpiration = $tenant->fresh()->expires_at->copy();

        $this->postJson(route('webhook.mercadopago', ['token' => 'expected-token']), $payload)->assertOk();
        $tenant->refresh();

        $this->assertTrue($tenant->expires_at->equalTo($firstExpiration));
        $this->assertSame('mp-repeat-1', $tenant->last_payment_id);
        $this->assertDatabaseCount('payments', 1);
    }
}
