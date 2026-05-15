<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('cash_session_movements', function (Blueprint $table) {
            $table->timestamp('cancelled_at')->nullable()->after('description');
            $table->foreignId('cancelled_by')->nullable()->after('cancelled_at')->constrained('users')->nullOnDelete();
            $table->text('cancellation_reason')->nullable()->after('cancelled_by');

            $table->index(['cash_session_id', 'type', 'cancelled_at']);
        });
    }

    public function down(): void
    {
        Schema::table('cash_session_movements', function (Blueprint $table) {
            $table->dropIndex(['cash_session_id', 'type', 'cancelled_at']);
            $table->dropConstrainedForeignId('cancelled_by');
            $table->dropColumn(['cancelled_at', 'cancellation_reason']);
        });
    }
};
