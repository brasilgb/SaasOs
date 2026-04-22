<?php

namespace Tests\Feature\Console;

use App\Mail\OrderBudgetFollowUpMail;
use App\Models\App\Customer;
use App\Models\App\Equipment;
use App\Models\App\Order;
use App\Models\App\OrderLog;
use App\Models\App\Other;
use App\Models\Tenant;
use App\Support\OrderStatus;
use App\Jobs\SendOrderBudgetFollowUpNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;

class SendBudgetFollowUpsCommandTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_sends_automatic_budget_follow_up_for_eligible_order(): void
    {
        Queue::fake();

        $tenant = Tenant::factory()->create();
        $customer = Customer::factory()->forTenant($tenant->id)->create([
            'email' => 'cliente@example.com',
        ]);
        $equipment = Equipment::factory()->forTenant($tenant->id)->create();

        Other::query()->create([
            'tenant_id' => $tenant->id,
            'mail_mailer' => 'smtp',
            'mail_host' => 'smtp.example.com',
            'mail_port' => 587,
            'mail_username' => 'user@example.com',
            'mail_password' => Crypt::encryptString('secret'),
            'mail_encryption' => 'tls',
            'mail_from_address' => 'noreply@example.com',
            'mail_from_name' => 'Sigma OS',
            'communication_follow_up_cooldown_days' => 2,
            'automatic_follow_ups_enabled' => true,
        ]);

        $order = Order::factory()->forTenant($tenant->id)->create([
            'customer_id' => $customer->id,
            'equipment_id' => $equipment->id,
            'service_status' => OrderStatus::BUDGET_GENERATED,
            'updated_at' => now()->subDays(3),
        ]);

        $this->artisan('sigmaos:send-budget-followups')
            ->expectsOutputToContain('Processadas: 1 | Enviadas: 1 | Ignoradas: 0')
            ->assertExitCode(0);

        Queue::assertPushed(SendOrderBudgetFollowUpNotification::class, 1);

        $this->assertDatabaseHas('order_logs', [
            'order_id' => $order->id,
            'action' => 'budget_follow_up_sent',
            'user_id' => null,
        ]);

        $log = OrderLog::query()->where('order_id', $order->id)->where('action', 'budget_follow_up_sent')->firstOrFail();
        $this->assertSame('automatic', $log->data['trigger'] ?? null);
    }

    public function test_it_skips_budget_order_with_recent_follow_up_log(): void
    {
        Queue::fake();

        $tenant = Tenant::factory()->create();
        $customer = Customer::factory()->forTenant($tenant->id)->create([
            'email' => 'cliente@example.com',
        ]);
        $equipment = Equipment::factory()->forTenant($tenant->id)->create();

        Other::query()->create([
            'tenant_id' => $tenant->id,
            'mail_mailer' => 'smtp',
            'mail_host' => 'smtp.example.com',
            'mail_port' => 587,
            'mail_username' => 'user@example.com',
            'mail_password' => Crypt::encryptString('secret'),
            'mail_encryption' => 'tls',
            'mail_from_address' => 'noreply@example.com',
            'mail_from_name' => 'Sigma OS',
            'communication_follow_up_cooldown_days' => 3,
            'automatic_follow_ups_enabled' => true,
        ]);

        $order = Order::factory()->forTenant($tenant->id)->create([
            'customer_id' => $customer->id,
            'equipment_id' => $equipment->id,
            'service_status' => OrderStatus::BUDGET_GENERATED,
            'updated_at' => now()->subDays(4),
        ]);

        OrderLog::query()->create([
            'order_id' => $order->id,
            'action' => 'budget_follow_up_sent',
            'data' => ['trigger' => 'automatic'],
            'created_at' => now()->subDay(),
        ]);

        $this->artisan('sigmaos:send-budget-followups')
            ->expectsOutputToContain('Processadas: 1 | Enviadas: 0 | Ignoradas: 1')
            ->assertExitCode(0);

        Queue::assertNothingPushed();
    }

    public function test_it_skips_budget_order_with_paused_automation(): void
    {
        Queue::fake();

        $tenant = Tenant::factory()->create();
        $customer = Customer::factory()->forTenant($tenant->id)->create([
            'email' => 'cliente@example.com',
        ]);
        $equipment = Equipment::factory()->forTenant($tenant->id)->create();

        Other::query()->create([
            'tenant_id' => $tenant->id,
            'mail_mailer' => 'smtp',
            'mail_host' => 'smtp.example.com',
            'mail_port' => 587,
            'mail_username' => 'user@example.com',
            'mail_password' => Crypt::encryptString('secret'),
            'mail_encryption' => 'tls',
            'mail_from_address' => 'noreply@example.com',
            'mail_from_name' => 'Sigma OS',
            'communication_follow_up_cooldown_days' => 2,
            'automatic_follow_ups_enabled' => true,
        ]);

        $order = Order::factory()->forTenant($tenant->id)->create([
            'customer_id' => $customer->id,
            'equipment_id' => $equipment->id,
            'service_status' => OrderStatus::BUDGET_GENERATED,
            'updated_at' => now()->subDays(5),
            'budget_follow_up_paused_at' => now()->subHour(),
            'budget_follow_up_pause_reason' => 'Cliente pediu contato só no próximo mês.',
        ]);

        $this->artisan('sigmaos:send-budget-followups')
            ->expectsOutputToContain('Processadas: 1 | Enviadas: 0 | Ignoradas: 1')
            ->assertExitCode(0);

        Queue::assertNothingPushed();

        $this->assertDatabaseMissing('order_logs', [
            'order_id' => $order->id,
            'action' => 'budget_follow_up_sent',
        ]);
    }

    public function test_budget_follow_up_job_delivers_mail(): void
    {
        Mail::fake();

        $tenant = Tenant::factory()->create();
        $customer = Customer::factory()->forTenant($tenant->id)->create([
            'email' => 'cliente@example.com',
        ]);
        $equipment = Equipment::factory()->forTenant($tenant->id)->create();

        Other::query()->create([
            'tenant_id' => $tenant->id,
            'mail_mailer' => 'smtp',
            'mail_host' => 'smtp.example.com',
            'mail_port' => 587,
            'mail_username' => 'user@example.com',
            'mail_password' => Crypt::encryptString('secret'),
            'mail_encryption' => 'tls',
            'mail_from_address' => 'noreply@example.com',
            'mail_from_name' => 'Sigma OS',
            'automatic_follow_ups_enabled' => true,
        ]);

        $order = Order::factory()->forTenant($tenant->id)->create([
            'customer_id' => $customer->id,
            'equipment_id' => $equipment->id,
            'service_status' => OrderStatus::BUDGET_GENERATED,
            'updated_at' => now()->subDays(3),
        ]);

        app(\App\Services\OrderNotificationService::class)->deliverBudgetFollowUp($order->id, 3);

        Mail::assertSent(OrderBudgetFollowUpMail::class, 1);
    }
}
