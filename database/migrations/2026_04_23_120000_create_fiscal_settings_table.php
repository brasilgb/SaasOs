<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('fiscal_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->boolean('enabled')->default(false);
            $table->string('provider', 50)->default('focus_nfe');
            $table->string('environment', 20)->default('sandbox');
            $table->text('api_token')->nullable();
            $table->text('webhook_secret')->nullable();
            $table->boolean('nfe_enabled')->default(false);
            $table->boolean('nfse_enabled')->default(false);
            $table->string('company_tax_regime', 50)->nullable();
            $table->string('state_registration', 50)->nullable();
            $table->string('municipal_registration', 50)->nullable();
            $table->string('service_city_code', 20)->nullable();
            $table->string('service_list_item', 30)->nullable();
            $table->decimal('default_iss_rate', 8, 4)->nullable();
            $table->string('default_nfe_series', 20)->nullable();
            $table->string('default_nfse_series', 20)->nullable();
            $table->string('default_ncm', 20)->nullable();
            $table->string('default_cfop', 10)->nullable();
            $table->string('default_commercial_unit', 10)->default('UN');
            $table->string('default_tax_unit', 10)->default('UN');
            $table->string('default_icms_origin', 5)->default('0');
            $table->string('default_icms_situation', 10)->default('102');
            $table->string('default_pis_situation', 10)->default('99');
            $table->string('default_cofins_situation', 10)->default('99');
            $table->timestamps();

            $table->unique('tenant_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('fiscal_settings');
    }
};
