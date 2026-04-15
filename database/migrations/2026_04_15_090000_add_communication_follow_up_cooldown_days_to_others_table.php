<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('others', function (Blueprint $table) {
            $table->unsignedSmallInteger('communication_follow_up_cooldown_days')
                ->nullable()
                ->after('warranty_return_alert_threshold');
        });
    }

    public function down(): void
    {
        Schema::table('others', function (Blueprint $table) {
            $table->dropColumn('communication_follow_up_cooldown_days');
        });
    }
};
