<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->unsignedTinyInteger('customer_feedback_rating')->nullable()->after('customer_pickup_acknowledged_at');
            $table->text('customer_feedback_comment')->nullable()->after('customer_feedback_rating');
            $table->timestamp('customer_feedback_submitted_at')->nullable()->after('customer_feedback_comment');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn([
                'customer_feedback_rating',
                'customer_feedback_comment',
                'customer_feedback_submitted_at',
            ]);
        });
    }
};
