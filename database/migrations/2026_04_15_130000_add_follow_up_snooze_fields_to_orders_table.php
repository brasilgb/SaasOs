<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dateTime('budget_follow_up_snoozed_until')->nullable()->after('budget_follow_up_pause_reason');
            $table->dateTime('payment_follow_up_snoozed_until')->nullable()->after('payment_follow_up_pause_reason');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn([
                'budget_follow_up_snoozed_until',
                'payment_follow_up_snoozed_until',
            ]);
        });
    }
};
