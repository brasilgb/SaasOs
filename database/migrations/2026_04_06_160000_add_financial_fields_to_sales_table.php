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
            $table->decimal('paid_amount', 10, 2)->default(0)->after('total_amount');
            $table->string('financial_status', 20)->default('pending')->after('paid_amount');
            $table->index(['tenant_id', 'financial_status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('sales', function (Blueprint $table) {
            $table->dropIndex(['tenant_id', 'financial_status']);
            $table->dropColumn(['paid_amount', 'financial_status']);
        });
    }
};
