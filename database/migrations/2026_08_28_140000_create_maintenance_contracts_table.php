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
        Schema::create('maintenance_contracts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignId('customer_id')->constrained('customers')->cascadeOnDelete();
            $table->unsignedInteger('contract_number')->nullable();
            $table->string('description');
            $table->decimal('monthly_amount', 10, 2);
            $table->unsignedTinyInteger('billing_day')->default(1);
            $table->date('start_date');
            $table->unsignedSmallInteger('duration_months')->nullable();
            $table->date('end_date')->nullable();
            $table->unsignedSmallInteger('visit_frequency_days')->nullable();
            $table->foreignId('preferred_technician_id')->nullable()->constrained('users')->nullOnDelete();
            $table->date('next_billing_date')->nullable();
            $table->date('next_schedule_date')->nullable();
            $table->string('status', 20)->default('active');
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['tenant_id', 'status']);
            $table->index(['tenant_id', 'next_billing_date']);
            $table->index(['tenant_id', 'next_schedule_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('maintenance_contracts');
    }
};
