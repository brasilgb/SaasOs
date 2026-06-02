<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('technician_schedule_status_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->nullable()->constrained()->cascadeOnDelete();
            $table->foreignId('schedule_id')->constrained('schedules')->cascadeOnDelete();
            $table->foreignId('order_id')->nullable()->constrained('orders')->nullOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->unsignedTinyInteger('status');
            $table->string('technician_status', 40)->nullable();
            $table->string('status_label', 80);
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->text('observations')->nullable();
            $table->timestamps();

            $table->index(['schedule_id', 'created_at'], 'tech_schedule_status_logs_schedule_created_idx');
            $table->index(['tenant_id', 'user_id', 'created_at'], 'tech_schedule_status_logs_tenant_user_created_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('technician_schedule_status_logs');
    }
};
