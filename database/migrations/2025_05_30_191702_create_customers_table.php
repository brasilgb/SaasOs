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
        Schema::create('customers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->nullable()->constrained()->onDelete('cascade');
            $table->integer('customer_number');
            $table->string('name');
            $table->string('cpf', 50)->nullable();
            $table->date('birth')->nullable();
            $table->string('email', 50)->nullable();
            $table->string('cep', 20)->nullable();
            $table->string('state', 20)->nullable();
            $table->string('city', 50)->nullable();
            $table->string('district', 50)->nullable();
            $table->string('street', 80)->nullable();
            $table->string('complement', 80)->nullable();
            $table->integer('number')->nullable();
            $table->string('phone', 20)->nullable();
            $table->string('contactname', 50)->nullable();
            $table->string('whatsapp', 50)->nullable();
            $table->string('contactphone', 20)->nullable();
            $table->text('observations')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('customers');
    }
};
