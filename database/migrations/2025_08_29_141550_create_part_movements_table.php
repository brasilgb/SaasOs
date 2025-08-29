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
        Schema::create('part_movements', function (Blueprint $table) {
            $table->id();

            // Chaves estrangeiras
            $table->foreignId('tenant_id')->constrained()->onDelete('cascade');
            $table->foreignId('part_id')->constrained()->onDelete('cascade');
            $table->foreignId('order_id')->nullable()->constrained('orders')->onDelete('set null');
            $table->foreignId('user_id')->constrained()->onDelete('restrict');

            // Dados do movimento
            $table->enum('movement_type', ['entrada', 'saida']);
            $table->integer('quantity');
            $table->string('reason');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('part_movements');
    }
};