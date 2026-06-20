<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->timestamp('customer_feedback_reminder_sent_at')
                ->nullable()
                ->after('customer_feedback_submitted_at');
            $table->timestamp('customer_feedback_request_expired_at')
                ->nullable()
                ->after('customer_feedback_reminder_sent_at');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn([
                'customer_feedback_reminder_sent_at',
                'customer_feedback_request_expired_at',
            ]);
        });
    }
};
