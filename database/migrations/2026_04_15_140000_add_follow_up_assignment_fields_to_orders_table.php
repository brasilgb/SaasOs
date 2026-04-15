<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->unsignedBigInteger('budget_follow_up_assigned_to')->nullable()->after('budget_follow_up_snoozed_until');
            $table->unsignedBigInteger('payment_follow_up_assigned_to')->nullable()->after('payment_follow_up_snoozed_until');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn([
                'budget_follow_up_assigned_to',
                'payment_follow_up_assigned_to',
            ]);
        });
    }
};
