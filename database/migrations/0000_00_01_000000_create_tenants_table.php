<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('tenants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('plan_id')->nullable()->constrained('plans');
            $table->string('name');
            $table->string('company')->nullable();
            $table->string('cnpj');
            $table->string('email');
            $table->string('phone')->nullable();
            $table->string('whatsapp')->nullable();
            $table->string('zip_code', 50)->nullable();
            $table->string('state', 50)->nullable();
            $table->string('city', 50)->nullable();
            $table->string('district', 50)->nullable();
            $table->string('street', 50)->nullable();
            $table->string('complement', 50)->nullable();
            $table->string('number', 50)->nullable();
            $table->integer('status');
            $table->string('subscription_status')->default('active');
            $table->text('observations')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->string('last_payment_id')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tenants');
    }
};
