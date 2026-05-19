<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (DB::getDriverName() !== 'mysql') {
            return;
        }

        $columns = [
            'budgets' => ['service'],
            'checklists' => ['checklist'],
            'expenses' => ['description'],
            'order_items' => ['description'],
            'schedules' => ['service'],
        ];

        foreach ($columns as $table => $tableColumns) {
            if (! Schema::hasTable($table)) {
                continue;
            }

            foreach ($tableColumns as $column) {
                if (Schema::hasColumn($table, $column)) {
                    DB::statement("ALTER TABLE `{$table}` MODIFY `{$column}` VARCHAR(500)");
                }
            }
        }
    }

    public function down(): void
    {
        //
    }
};
