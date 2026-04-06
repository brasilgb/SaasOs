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
        Schema::create('cash_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignId('opened_by')->constrained('users')->cascadeOnDelete();
            $table->foreignId('closed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('opened_at');
            $table->timestamp('closed_at')->nullable();
            $table->decimal('opening_balance', 12, 2)->default(0);
            $table->decimal('closing_balance', 12, 2)->nullable();
            $table->decimal('expected_balance', 12, 2)->nullable();
            $table->decimal('difference', 12, 2)->nullable();
            $table->decimal('total_completed_sales', 12, 2)->default(0);
            $table->decimal('total_cancelled_sales', 12, 2)->default(0);
            $table->decimal('manual_entries', 12, 2)->default(0);
            $table->decimal('manual_exits', 12, 2)->default(0);
            $table->string('status', 20)->default('open');
            $table->text('notes')->nullable();
            $table->text('closing_notes')->nullable();
            $table->timestamps();

            $table->index(['tenant_id', 'status']);
            $table->index(['tenant_id', 'opened_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cash_sessions');
    }
};
