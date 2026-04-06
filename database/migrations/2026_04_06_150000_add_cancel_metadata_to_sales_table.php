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
        Schema::table('sales', function (Blueprint $table) {
            $table->foreignId('cancelled_by')->nullable()->after('cancelled_at')->constrained('users')->nullOnDelete();
            $table->text('cancel_reason')->nullable()->after('cancelled_by');
            $table->index(['tenant_id', 'status', 'cancelled_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('sales', function (Blueprint $table) {
            $table->dropIndex(['tenant_id', 'status', 'cancelled_at']);
            $table->dropForeign(['cancelled_by']);
            $table->dropColumn(['cancelled_by', 'cancel_reason']);
        });
    }
};
