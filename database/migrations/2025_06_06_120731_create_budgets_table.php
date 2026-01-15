<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('budgets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->nullable()->constrained()->onDelete('cascade');

            $table->bigInteger('budget_number');              // budget_number
            $table->string('category', 50);                   // categoria
            $table->string('service', 150);                   // servico
            $table->string('model')->nullable();              // modelo
            $table->text('description')->nullable();          // descricao
            $table->string('estimated_time', 50)->nullable(); // tempo_estimado
            $table->decimal('part_value', 10, 2)->nullable(); // valor_peca
            $table->decimal('labor_value', 10, 2);            // valor_mao_obra
            $table->decimal('total_value', 10, 2);            // valor_total
            $table->string('warranty', 50)->nullable();       // garantia
            $table->integer('validity')->nullable();        // Prazo
            $table->text('obs')->nullable();                  // observacoes
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('budgets');
    }
};
