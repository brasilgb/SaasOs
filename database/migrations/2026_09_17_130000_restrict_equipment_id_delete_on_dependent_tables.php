<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    private array $tables = ['orders', 'budgets', 'checklists'];

    public function up(): void
    {
        foreach ($this->tables as $table) {
            Schema::table($table, function (Blueprint $blueprint) {
                $blueprint->dropForeign(['equipment_id']);
                $blueprint->foreign('equipment_id')->references('id')->on('equipment')->restrictOnDelete();
            });
        }
    }

    public function down(): void
    {
        foreach ($this->tables as $table) {
            Schema::table($table, function (Blueprint $blueprint) {
                $blueprint->dropForeign(['equipment_id']);
                $blueprint->foreign('equipment_id')->references('id')->on('equipment')->cascadeOnDelete();
            });
        }
    }
};
