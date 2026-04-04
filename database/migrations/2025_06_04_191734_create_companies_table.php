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
        Schema::create('companies', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->nullable()->constrained()->onDelete('cascade');
            $table->string('shortname', 50)->nullable();
            $table->string('companyname', 50)->nullable();
            $table->string('cnpj', 50)->nullable();
            $table->string('logo', 100)->nullable();
            $table->string('zip_code', 50)->nullable();
            $table->string('state', 50)->nullable();
            $table->string('city', 50)->nullable();
            $table->string('district', 50)->nullable();
            $table->string('street', 50)->nullable();
            $table->string('number', 50)->nullable();
            $table->string('complement', 50)->nullable();
            $table->string('telephone', 50)->nullable();
            $table->string('whatsapp', 50)->nullable();
            $table->string('site', 50)->nullable();
            $table->string('email', 50)->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('companies');
    }
};
