<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('fiscal_settings')) {
            DB::table('fiscal_settings')->update([
                'enabled' => false,
                'nfe_enabled' => false,
                'nfse_enabled' => false,
                'provider' => 'manual',
                'api_token' => null,
                'webhook_secret' => null,
                'updated_at' => now(),
            ]);
        }

        if (Schema::hasTable('admin_fiscal_settings')) {
            DB::table('admin_fiscal_settings')->update([
                'enabled' => false,
                'provider' => 'manual',
                'api_token' => null,
                'webhook_secret' => null,
                'updated_at' => now(),
            ]);
        }
    }

    public function down(): void
    {
        // Credenciais removidas intencionalmente não podem ser restauradas.
    }
};
