<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('admin_fiscal_settings', function (Blueprint $table) {
            $table->id();
            $table->boolean('enabled')->default(false);
            $table->string('provider', 50)->default('focus_nfe');
            $table->string('environment', 20)->default('sandbox');
            $table->text('api_token')->nullable();
            $table->text('webhook_secret')->nullable();
            $table->string('legal_name')->nullable();
            $table->string('trade_name')->nullable();
            $table->string('cnpj', 50)->nullable();
            $table->string('municipal_registration', 50)->nullable();
            $table->string('service_city_code', 20)->nullable();
            $table->string('service_list_item', 30)->nullable();
            $table->decimal('default_iss_rate', 8, 4)->nullable();
            $table->string('tax_regime', 50)->nullable();
            $table->string('zip_code', 50)->nullable();
            $table->string('state', 50)->nullable();
            $table->string('city', 80)->nullable();
            $table->string('district', 80)->nullable();
            $table->string('street', 120)->nullable();
            $table->string('number', 50)->nullable();
            $table->string('complement', 100)->nullable();
            $table->string('default_service_description', 500)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('admin_fiscal_settings');
    }
};
