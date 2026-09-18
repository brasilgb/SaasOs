<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('order_parts', function (Blueprint $table) {
            $table->dropForeign(['part_id']);
            $table->foreign('part_id')->references('id')->on('parts')->restrictOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('order_parts', function (Blueprint $table) {
            $table->dropForeign(['part_id']);
            $table->foreign('part_id')->references('id')->on('parts')->cascadeOnDelete();
        });
    }
};
