<?php

namespace App\Console\Commands;

use App\Mail\OrderBudgetFollowUpMail;
use App\Models\App\Order;
use App\Models\App\OrderLog;
use App\Models\App\Other;
use App\Support\OrderStatus;
use App\Support\TenantMailConfig;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

class SendBudgetFollowUps extends Command
{
    protected $signature = 'sigmaos:send-budget-followups {--tenant=} {--dry-run}';

    protected $description = 'Envia follow-up automático para orçamentos parados';

    private function cooldownDays(?int $tenantId): int
    {
        return Other::communicationFollowUpCooldownDays($tenantId);
    }

    private function hasRecentFollowUp(Order $order): bool
    {
        return OrderLog::query()
            ->where('order_id', $order->id)
            ->where('action', 'budget_follow_up_sent')
            ->where('created_at', '>=', now()->subDays($this->cooldownDays($order->tenant_id ? (int) $order->tenant_id : null)))
            ->exists();
    }

    private function eligibleOrders()
    {
        $query = Order::query()
            ->with('customer', 'tenant')
            ->where('service_status', OrderStatus::BUDGET_GENERATED);

        if ($tenantId = $this->option('tenant')) {
            $query->where('tenant_id', (int) $tenantId);
        }

        return $query->orderBy('tenant_id')->orderBy('id')->get();
    }

    public function handle(): int
    {
        $dryRun = (bool) $this->option('dry-run');
        $processed = 0;
        $sent = 0;
        $skipped = 0;

        foreach ($this->eligibleOrders() as $order) {
            $processed++;

            $tenantId = $order->tenant_id ? (int) $order->tenant_id : null;
            $cooldownDays = $this->cooldownDays($tenantId);
            $customerEmail = trim((string) ($order->customer?->email ?? ''));
            $daysPending = max(0, ($order->updated_at ?? $order->created_at)?->diffInDays(now()) ?? 0);

            if ($daysPending < $cooldownDays) {
                $skipped++;
                continue;
            }

            if (! is_null($order->budget_follow_up_paused_at)) {
                $skipped++;
                continue;
            }

            if ($customerEmail === '' || ! filter_var($customerEmail, FILTER_VALIDATE_EMAIL)) {
                $skipped++;
                continue;
            }

            if (! TenantMailConfig::hasConfiguredForTenantId($tenantId)) {
                $skipped++;
                continue;
            }

            if ($this->hasRecentFollowUp($order)) {
                $skipped++;
                continue;
            }

            if ($dryRun) {
                $this->line(sprintf(
                    'Dry-run: OS #%s tenant %s orçamento parado há %d dias -> %s',
                    $order->order_number,
                    $tenantId ?? '-',
                    $daysPending,
                    $customerEmail
                ));
                $sent++;
                continue;
            }

            try {
                TenantMailConfig::applyForTenantId($tenantId);
                Mail::to($customerEmail)->send(new OrderBudgetFollowUpMail($order, $daysPending));

                OrderLog::create([
                    'order_id' => $order->id,
                    'user_id' => null,
                    'action' => 'budget_follow_up_sent',
                    'data' => [
                        'channel' => 'email',
                        'recipient' => $customerEmail,
                        'days_pending' => $daysPending,
                        'trigger' => 'automatic',
                    ],
                    'created_at' => now(),
                ]);

                $sent++;
            } catch (\Throwable $e) {
                report($e);
                $skipped++;
                $this->warn(sprintf('Falha ao enviar follow-up da OS #%s: %s', $order->order_number, $e->getMessage()));
            }
        }

        $this->info(sprintf('Processadas: %d | Enviadas: %d | Ignoradas: %d', $processed, $sent, $skipped));

        return self::SUCCESS;
    }
}
