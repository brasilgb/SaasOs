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
        Schema::create('customer_equipments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->nullable()->constrained()->onDelete('cascade');
            $table->foreignId('customer_id')->constrained()->restrictOnDelete();
            $table->foreignId('equipment_id')->nullable()->constrained('equipment')->restrictOnDelete();

            $table->integer('customer_equipment_number');

            $table->string('brand')->nullable();
            $table->string('model')->nullable();
            $table->string('serial_number')->nullable();
            $table->string('imei', 20)->nullable();
            $table->string('color')->nullable();
            $table->text('accessories')->nullable();
            $table->text('notes')->nullable();
            $table->string('status')->default('active');

            $table->timestamps();

            $table->unique(['tenant_id', 'customer_equipment_number']);
            $table->index(['tenant_id', 'customer_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('customer_equipments');
    }
};
