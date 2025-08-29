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
        Schema::create('receipts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->onDelete('cascade');
            $table->text('receivingequipment')->nullable(); // Impressão de recibos recebimento de equipamento
            $table->text('equipmentdelivery')->nullable();  // Impressão de recibos entrega equipamento
            $table->text('budgetissuance')->nullable();     // Impressão de recibos emissão de orçamento
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('receipts');
    }
};
