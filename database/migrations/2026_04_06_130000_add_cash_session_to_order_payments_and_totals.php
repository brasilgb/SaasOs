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
        Schema::table('order_payments', function (Blueprint $table) {
            $table->foreignId('cash_session_id')
                ->nullable()
                ->after('order_id')
                ->constrained('cash_sessions')
                ->nullOnDelete();

            $table->index(['cash_session_id', 'paid_at']);
        });

        Schema::table('cash_sessions', function (Blueprint $table) {
            $table->decimal('total_order_payments', 12, 2)
                ->default(0)
                ->after('total_completed_sales');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('order_payments', function (Blueprint $table) {
            $table->dropIndex(['cash_session_id', 'paid_at']);
            $table->dropForeign(['cash_session_id']);
            $table->dropColumn('cash_session_id');
        });

        Schema::table('cash_sessions', function (Blueprint $table) {
            $table->dropColumn('total_order_payments');
        });
    }
};
