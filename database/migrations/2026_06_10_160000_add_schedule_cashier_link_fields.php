<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('schedules', function (Blueprint $table) {
            if (! Schema::hasColumn('schedules', 'local_payment_cash_session_id')) {
                $table->foreignId('local_payment_cash_session_id')
                    ->nullable()
                    ->after('local_payment_user_id')
                    ->constrained('cash_sessions')
                    ->nullOnDelete();
            }

            if (! Schema::hasColumn('schedules', 'local_payment_cash_registered_at')) {
                $table->timestamp('local_payment_cash_registered_at')->nullable()->after('local_payment_cash_session_id');
            }
        });

        Schema::table('cash_session_movements', function (Blueprint $table) {
            if (! Schema::hasColumn('cash_session_movements', 'source_type')) {
                $table->string('source_type', 50)->nullable()->after('description');
            }

            if (! Schema::hasColumn('cash_session_movements', 'source_id')) {
                $table->unsignedBigInteger('source_id')->nullable()->after('source_type');
            }

            if (! $this->hasIndex('cash_session_movements', 'cash_session_movements_source_idx')) {
                $table->index(['source_type', 'source_id'], 'cash_session_movements_source_idx');
            }
        });
    }

    public function down(): void
    {
        Schema::table('cash_session_movements', function (Blueprint $table) {
            if ($this->hasIndex('cash_session_movements', 'cash_session_movements_source_idx')) {
                $table->dropIndex('cash_session_movements_source_idx');
            }

            $table->dropColumn(array_filter([
                Schema::hasColumn('cash_session_movements', 'source_id') ? 'source_id' : null,
                Schema::hasColumn('cash_session_movements', 'source_type') ? 'source_type' : null,
            ]));
        });

        Schema::table('schedules', function (Blueprint $table) {
            if (Schema::hasColumn('schedules', 'local_payment_cash_session_id')) {
                $table->dropForeign(['local_payment_cash_session_id']);
            }

            $table->dropColumn(array_filter([
                Schema::hasColumn('schedules', 'local_payment_cash_registered_at') ? 'local_payment_cash_registered_at' : null,
                Schema::hasColumn('schedules', 'local_payment_cash_session_id') ? 'local_payment_cash_session_id' : null,
            ]));
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
