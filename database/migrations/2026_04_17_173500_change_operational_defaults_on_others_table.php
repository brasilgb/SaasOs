<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('others', function (Blueprint $table) {
            $table->boolean('show_follow_ups_menu')->default(false)->change();
            $table->boolean('show_tasks_menu')->default(false)->change();
            $table->boolean('show_commercial_performance_menu')->default(false)->change();
            $table->boolean('show_quality_menu')->default(false)->change();
        });

        DB::table('others')
            ->whereNull('show_follow_ups_menu')
            ->update(['show_follow_ups_menu' => false]);

        DB::table('others')
            ->whereNull('show_tasks_menu')
            ->update(['show_tasks_menu' => false]);

        DB::table('others')
            ->whereNull('show_commercial_performance_menu')
            ->update(['show_commercial_performance_menu' => false]);

        DB::table('others')
            ->whereNull('show_quality_menu')
            ->update(['show_quality_menu' => false]);
    }

    public function down(): void
    {
        Schema::table('others', function (Blueprint $table) {
            $table->boolean('show_follow_ups_menu')->default(true)->change();
            $table->boolean('show_tasks_menu')->default(true)->change();
            $table->boolean('show_commercial_performance_menu')->default(true)->change();
            $table->boolean('show_quality_menu')->default(true)->change();
        });
    }
};
