<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('parts') || ! $this->hasIndex('parts', 'parts_category_unique')) {
            return;
        }

        Schema::table('parts', function (Blueprint $table) {
            $table->dropUnique('parts_category_unique');
        });
    }

    public function down(): void
    {
        if (! Schema::hasTable('parts') || $this->hasIndex('parts', 'parts_category_unique')) {
            return;
        }

        Schema::table('parts', function (Blueprint $table) {
            $table->unique('category', 'parts_category_unique');
        });
    }

    private function hasIndex(string $table, string $index): bool
    {
        $driver = DB::getDriverName();

        if ($driver === 'mysql') {
            return count(DB::select("SHOW INDEX FROM {$table} WHERE Key_name = ?", [$index])) > 0;
        }

        if ($driver === 'sqlite') {
            return collect(DB::select("PRAGMA index_list('{$table}')"))
                ->contains(fn ($row) => ($row->name ?? null) === $index);
        }

        return true;
    }
};
