<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('parts', function (Blueprint $table) {
            $table->string('ncm', 8)->nullable()->after('description');
            $table->string('cfop', 4)->nullable()->after('ncm');
        });

        DB::table('fiscal_settings')
            ->whereNotNull('tenant_id')
            ->orderBy('id')
            ->each(function ($setting): void {
                DB::table('parts')
                    ->where('tenant_id', $setting->tenant_id)
                    ->whereNull('ncm')
                    ->update([
                        'ncm' => preg_replace('/\D+/', '', (string) $setting->default_ncm) ?: null,
                        'cfop' => preg_replace('/\D+/', '', (string) $setting->default_cfop) ?: null,
                    ]);
            });

        Schema::table('fiscal_settings', function (Blueprint $table) {
            $table->dropColumn(['default_ncm', 'default_cfop']);
        });
    }

    public function down(): void
    {
        Schema::table('fiscal_settings', function (Blueprint $table) {
            $table->string('default_ncm', 20)->nullable();
            $table->string('default_cfop', 10)->nullable();
        });

        Schema::table('parts', function (Blueprint $table) {
            $table->dropColumn(['ncm', 'cfop']);
        });
    }
};
