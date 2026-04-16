<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->unsignedBigInteger('customer_feedback_recovery_assigned_to')->nullable()->after('customer_feedback_submitted_at');
            $table->string('customer_feedback_recovery_status', 30)->nullable()->after('customer_feedback_recovery_assigned_to');
            $table->text('customer_feedback_recovery_notes')->nullable()->after('customer_feedback_recovery_status');
            $table->timestamp('customer_feedback_recovery_updated_at')->nullable()->after('customer_feedback_recovery_notes');

            $table->foreign('customer_feedback_recovery_assigned_to')
                ->references('id')
                ->on('users')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropForeign(['customer_feedback_recovery_assigned_to']);
            $table->dropColumn([
                'customer_feedback_recovery_assigned_to',
                'customer_feedback_recovery_status',
                'customer_feedback_recovery_notes',
                'customer_feedback_recovery_updated_at',
            ]);
        });
    }
};
