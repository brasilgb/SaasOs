<?php

namespace App\Console\Commands;

use App\Models\App\Order;
use App\Models\App\OrderLog;
use App\Models\App\Other;
use App\Services\OrderNotificationService;
use App\Support\OrderStatus;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;

class SendPaymentFollowUps extends Command
{
    protected $signature = 'sigmaos:send-payment-followups {--tenant=} {--dry-run}';

    protected $description = 'Envia lembretes automáticos de cobrança para ordens elegíveis';

    public function __construct(private readonly OrderNotificationService $orderNotificationService)
    {
        parent::__construct();
    }

    private function cooldownDays(?int $tenantId): int
    {
        return Other::communicationFollowUpCooldownDays($tenantId);
    }

    private function remainingAmount(Order $order): float
    {
        $totalOrder = round((float) ($order->service_cost ?? 0), 2);
        $totalPaid = round((float) ($order->total_paid ?? 0), 2);

        return round(max(0, $totalOrder - $totalPaid), 2);
    }

    private function hasRecentReminder(Order $order): bool
    {
        $tenantId = $order->tenant_id ? (int) $order->tenant_id : null;

        return OrderLog::query()
            ->where('order_id', $order->id)
            ->where('action', 'payment_reminder_sent')
            ->where('created_at', '>=', now()->subDays($this->cooldownDays($tenantId)))
            ->exists();
    }

    private function eligibleOrders()
    {
        $query = Order::query()
            ->with('customer')
            ->withSum('orderPayments as total_paid', 'amount')
            ->whereIn('service_status', [
                OrderStatus::SERVICE_COMPLETED,
                OrderStatus::CUSTOMER_NOTIFIED,
                OrderStatus::DELIVERED,
            ])
            ->where(function ($builder) {
                $builder
                    ->where(function ($dateQuery) {
                        $dateQuery->whereNotNull('delivery_date')
                            ->where('delivery_date', '<=', now()->subDays(1));
                    })
                    ->orWhere(function ($dateQuery) {
                        $dateQuery->whereNull('delivery_date')
                            ->where('updated_at', '<=', now()->subDays(1));
                    });
            });

        if ($tenantId = $this->option('tenant')) {
            $query->where('tenant_id', (int) $tenantId);
        }

        return $query->orderBy('tenant_id')->orderBy('id')->get();
    }

    public function handle(): int
    {
        $dryRun = (bool) $this->option('dry-run');
        $eligibleOrders = $this->eligibleOrders();

        $processed = 0;
        $sent = 0;
        $skipped = 0;

        foreach ($eligibleOrders as $order) {
            $processed++;
            $tenantId = $order->tenant_id ? (int) $order->tenant_id : null;
            $cooldownDays = $this->cooldownDays($tenantId);
            $referenceDate = $order->delivery_date ?? $order->updated_at ?? $order->created_at;
            $daysPending = $referenceDate ? max(0, $referenceDate->diffInDays(now())) : 0;

            $remaining = $this->remainingAmount($order);
            $customerEmail = trim((string) ($order->customer?->email ?? ''));

            if ($daysPending < $cooldownDays) {
                $skipped++;
                continue;
            }

            if (! is_null($order->payment_follow_up_paused_at)) {
                $skipped++;
                continue;
            }

            if ($remaining <= 0.009) {
                $skipped++;
                continue;
            }

            if ($customerEmail === '' || ! filter_var($customerEmail, FILTER_VALIDATE_EMAIL)) {
                $skipped++;
                continue;
            }

            if (! $this->orderNotificationService->canSendToCustomer($order, $customerEmail)) {
                $skipped++;
                continue;
            }

            if ($this->hasRecentReminder($order)) {
                $skipped++;
                continue;
            }

            if ($dryRun) {
                $this->line(sprintf(
                    'Dry-run: ordem #%s tenant %s saldo %s -> %s',
                    $order->order_number,
                    $order->tenant_id ?? '-',
                    number_format($remaining, 2, ',', '.'),
                    $customerEmail
                ));
                $sent++;
                continue;
            }

            try {
                $this->orderNotificationService->sendPaymentReminder(
                    $order->loadMissing('customer', 'tenant'),
                    [
                        'parts_value' => round((float) ($order->parts_value ?? 0), 2),
                        'service_value' => round((float) ($order->service_value ?? 0), 2),
                        'total_order' => round((float) ($order->service_cost ?? 0), 2),
                        'total_paid' => round((float) ($order->total_paid ?? 0), 2),
                        'remaining' => $remaining,
                    ],
                    ! empty($order->delivery_date) && Carbon::parse($order->delivery_date)->lt(now()->subDays(7))
                );

                OrderLog::create([
                    'order_id' => $order->id,
                    'user_id' => null,
                    'action' => 'payment_reminder_sent',
                    'data' => [
                        'channel' => 'email',
                        'recipient' => $customerEmail,
                        'remaining' => $remaining,
                        'is_overdue' => ! empty($order->delivery_date) && Carbon::parse($order->delivery_date)->lt(now()->subDays(7)),
                        'trigger' => 'automatic',
                    ],
                        'created_at' => now(),
                ]);

                $sent++;
            } catch (\Throwable $e) {
                report($e);
                $skipped++;
                $this->warn(sprintf('Falha ao enviar cobrança da ordem #%s: %s', $order->order_number, $e->getMessage()));
            }
        }

        $this->info(sprintf(
            'Processadas: %d | Enviadas: %d | Ignoradas: %d',
            $processed,
            $sent,
            $skipped
        ));

        return self::SUCCESS;
    }
}
