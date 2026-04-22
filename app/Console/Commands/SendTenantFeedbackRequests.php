<?php

namespace App\Console\Commands;

use App\Mail\TenantFeedbackRequestMail;
use App\Models\Tenant;
use App\Models\TenantFeedback;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class SendTenantFeedbackRequests extends Command
{
    protected $signature = 'sigmaos:send-tenant-feedback-requests {--force : Reenvia e recria mesmo que ja exista um feedback onboarding_7d}';

    protected $description = 'Cria e envia pedidos de feedback para clientes SaaS elegiveis';

    private const SOURCE = 'onboarding_7d';
    private const DELAY_DAYS = 7;
    private const EXPIRES_IN_DAYS = 14;

    public function handle(): int
    {
        $force = (bool) $this->option('force');
        $sentCount = 0;
        $skippedCount = 0;

        Tenant::query()
            ->orderBy('id')
            ->chunkById(100, function ($tenants) use ($force, &$sentCount, &$skippedCount) {
                foreach ($tenants as $tenant) {
                    $email = trim((string) $tenant->email);

                    if (! filter_var($email, FILTER_VALIDATE_EMAIL)) {
                        $skippedCount++;
                        continue;
                    }

                    if ($tenant->created_at?->gt(now()->subDays(self::DELAY_DAYS))) {
                        $skippedCount++;
                        continue;
                    }

                    $existing = TenantFeedback::query()
                        ->where('tenant_id', $tenant->id)
                        ->where('feedback_source', self::SOURCE)
                        ->latest('id')
                        ->first();

                    if ($existing && ! $force) {
                        $skippedCount++;
                        continue;
                    }

                    if ($existing && $force) {
                        $existing->delete();
                    }

                    $feedback = TenantFeedback::query()->create([
                        'tenant_id' => $tenant->id,
                        'feedback_token' => (string) Str::uuid(),
                        'feedback_source' => self::SOURCE,
                        'feedback_status' => 'pending',
                        'feedback_sent_at' => now(),
                        'feedback_expires_at' => now()->addDays(self::EXPIRES_IN_DAYS),
                    ]);

                    Mail::to($email)->send(new TenantFeedbackRequestMail($tenant, $feedback));

                    $sentCount++;
                    $this->line("Pedido de feedback enviado para {$email} ({$tenant->company})");
                }
            });

        $this->info("Processo concluido. Enviados: {$sentCount}. Ignorados: {$skippedCount}.");

        return self::SUCCESS;
    }
}
