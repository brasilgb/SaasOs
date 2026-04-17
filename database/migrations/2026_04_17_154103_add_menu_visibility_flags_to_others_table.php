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
        Schema::table('others', function (Blueprint $table) {
            $table->boolean('show_follow_ups_menu')->default(true)->after('enablesales');
            $table->boolean('show_tasks_menu')->default(true)->after('show_follow_ups_menu');
            $table->boolean('show_commercial_performance_menu')->default(true)->after('show_tasks_menu');
            $table->boolean('show_quality_menu')->default(true)->after('show_commercial_performance_menu');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('others', function (Blueprint $table) {
            $table->dropColumn([
                'show_follow_ups_menu',
                'show_tasks_menu',
                'show_commercial_performance_menu',
                'show_quality_menu',
            ]);
        });
    }
};
