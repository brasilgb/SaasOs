<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->string('budget_follow_up_response_status')->nullable()->after('budget_follow_up_pause_reason');
            $table->timestamp('budget_follow_up_response_at')->nullable()->after('budget_follow_up_response_status');
            $table->string('payment_follow_up_response_status')->nullable()->after('payment_follow_up_pause_reason');
            $table->timestamp('payment_follow_up_response_at')->nullable()->after('payment_follow_up_response_status');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn([
                'budget_follow_up_response_status',
                'budget_follow_up_response_at',
                'payment_follow_up_response_status',
                'payment_follow_up_response_at',
            ]);
        });
    }
};
