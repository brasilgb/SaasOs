<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('fiscal_settings', function (Blueprint $table) {
            $table->string('nfse_operation_indicator', 6)->default('050101')->after('nfse_special_tax_regime');
        });
    }

    public function down(): void
    {
        Schema::table('fiscal_settings', function (Blueprint $table) {
            $table->dropColumn('nfse_operation_indicator');
        });
    }
};
