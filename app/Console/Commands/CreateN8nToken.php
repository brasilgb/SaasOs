<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Support\TenantSequence;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class CreateN8nToken extends Command
{
    protected $signature = 'vetoros:create-n8n-token {tenant_id : ID do tenant que o n8n vai operar}';

    protected $description = 'Cria (ou reaproveita) o usuário de integração do n8n e emite um novo token Sanctum para ele';

    public function handle(): int
    {
        $tenantId = (int) $this->argument('tenant_id');

        $user = User::withoutGlobalScopes()
            ->where('tenant_id', $tenantId)
            ->where('email', "n8n-integration+{$tenantId}@vetoros.local")
            ->first();

        if (! $user) {
            $user = User::withoutGlobalScopes()->create([
                'tenant_id' => $tenantId,
                'user_number' => TenantSequence::next(User::class, 'user_number', $tenantId),
                'name' => 'n8n (integração)',
                'email' => "n8n-integration+{$tenantId}@vetoros.local",
                'password' => Hash::make(Str::random(40)),
                'roles' => User::ROLE_ADMIN,
                'status' => 1,
            ]);

            $this->info("Usuário de integração criado (id {$user->id}) para o tenant {$tenantId}.");
        } else {
            $user->tokens()->delete();
            $this->info("Usuário de integração já existia (id {$user->id}); tokens antigos revogados.");
        }

        $token = $user->createToken('n8n-integration')->plainTextToken;

        $this->newLine();
        $this->info('Token gerado (copie agora, ele não será exibido novamente):');
        $this->line($token);
        $this->newLine();
        $this->line('Use este token no header Authorization do n8n: Bearer '.$token);

        return self::SUCCESS;
    }
}
