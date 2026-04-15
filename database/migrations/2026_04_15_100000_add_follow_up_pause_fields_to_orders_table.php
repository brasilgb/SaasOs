<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->timestamp('budget_follow_up_paused_at')->nullable()->after('feedback');
            $table->foreignId('budget_follow_up_paused_by')->nullable()->after('budget_follow_up_paused_at')->constrained('users')->nullOnDelete();
            $table->text('budget_follow_up_pause_reason')->nullable()->after('budget_follow_up_paused_by');
            $table->timestamp('payment_follow_up_paused_at')->nullable()->after('budget_follow_up_pause_reason');
            $table->foreignId('payment_follow_up_paused_by')->nullable()->after('payment_follow_up_paused_at')->constrained('users')->nullOnDelete();
            $table->text('payment_follow_up_pause_reason')->nullable()->after('payment_follow_up_paused_by');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropConstrainedForeignId('budget_follow_up_paused_by');
            $table->dropConstrainedForeignId('payment_follow_up_paused_by');
            $table->dropColumn([
                'budget_follow_up_paused_at',
                'budget_follow_up_pause_reason',
                'payment_follow_up_paused_at',
                'payment_follow_up_pause_reason',
            ]);
        });
    }
};
