<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('others', function (Blueprint $table) {
            $table->boolean('automatic_follow_ups_enabled')
                ->default(false)
                ->after('communication_follow_up_cooldown_days');
        });
    }

    public function down(): void
    {
        Schema::table('others', function (Blueprint $table) {
            $table->dropColumn('automatic_follow_ups_enabled');
        });
    }
};
