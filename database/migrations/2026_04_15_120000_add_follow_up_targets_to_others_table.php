<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('others', function (Blueprint $table) {
            $table->decimal('budget_conversion_target', 5, 2)->nullable()->after('communication_follow_up_cooldown_days');
            $table->decimal('payment_recovery_target', 5, 2)->nullable()->after('budget_conversion_target');
        });
    }

    public function down(): void
    {
        Schema::table('others', function (Blueprint $table) {
            $table->dropColumn([
                'budget_conversion_target',
                'payment_recovery_target',
            ]);
        });
    }
};
