<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('fiscal_settings') || ! Schema::hasColumn('fiscal_settings', 'nfse_mode')) {
            return;
        }

        DB::table('fiscal_settings')
            ->where(function ($query) {
                $query->whereNull('nfse_mode')
                    ->orWhere('nfse_mode', 'municipal');
            })
            ->update([
                'nfse_mode' => 'national',
                'updated_at' => now(),
            ]);
    }

    public function down(): void
    {
        if (! Schema::hasTable('fiscal_settings') || ! Schema::hasColumn('fiscal_settings', 'nfse_mode')) {
            return;
        }

        DB::table('fiscal_settings')
            ->where('nfse_mode', 'national')
            ->update([
                'nfse_mode' => 'municipal',
                'updated_at' => now(),
            ]);
    }
};
