<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('fiscal_settings', function (Blueprint $table) {
            $table->string('nfse_mode', 20)->default('municipal')->after('nfse_enabled');
            $table->unsignedTinyInteger('nfse_simple_option')->nullable()->after('nfse_mode');
            $table->unsignedTinyInteger('nfse_special_tax_regime')->default(0)->after('nfse_simple_option');
            $table->string('nfse_ibs_cbs_situation', 3)->nullable()->after('default_iss_rate');
            $table->string('nfse_ibs_cbs_classification', 6)->nullable()->after('nfse_ibs_cbs_situation');
        });
    }

    public function down(): void
    {
        Schema::table('fiscal_settings', function (Blueprint $table) {
            $table->dropColumn([
                'nfse_mode',
                'nfse_simple_option',
                'nfse_special_tax_regime',
                'nfse_ibs_cbs_situation',
                'nfse_ibs_cbs_classification',
            ]);
        });
    }
};
