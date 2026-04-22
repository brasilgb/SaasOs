<?php

namespace App\Console\Commands;

use App\Mail\SubscriptionStatusMail;
use App\Models\Tenant;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

class SendSubscriptionStatusNotifications extends Command
{
    protected $signature = 'sigmaos:send-subscription-status-notifications {--force : Reenvia mesmo se o aviso atual ja tiver sido enviado}';

    protected $description = 'Envia avisos de assinatura para tenants com vencimento proximo, carencia ou bloqueio';

    public function handle(): int
    {
        $force = (bool) $this->option('force');
        $sentCount = 0;
        $skippedCount = 0;

        Tenant::query()
            ->with('plan')
            ->orderBy('id')
            ->chunkById(100, function ($tenants) use ($force, &$sentCount, &$skippedCount) {
                foreach ($tenants as $tenant) {
                    $notice = $tenant->subscriptionNoticeData();

                    if (! $notice || ! filter_var(trim((string) $tenant->email), FILTER_VALIDATE_EMAIL)) {
                        $skippedCount++;
                        continue;
                    }

                    if (! $force && $tenant->last_subscription_notice_key === $notice['key']) {
                        $skippedCount++;
                        continue;
                    }

                    Mail::to(trim((string) $tenant->email))->send(new SubscriptionStatusMail($tenant, $notice));

                    $tenant->forceFill([
                        'last_subscription_notice_key' => $notice['key'],
                        'last_subscription_notice_sent_at' => now(),
                    ])->save();

                    $sentCount++;
                    $this->line("Aviso enviado para {$tenant->email} sobre {$tenant->company} ({$notice['key']})");
                }
            });

        $this->info("Processo concluido. Enviados: {$sentCount}. Ignorados: {$skippedCount}.");

        return self::SUCCESS;
    }
}
