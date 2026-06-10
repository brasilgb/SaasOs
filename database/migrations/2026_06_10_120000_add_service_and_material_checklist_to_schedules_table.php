<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('schedules', function (Blueprint $table) {
            if (! Schema::hasColumn('schedules', 'service')) {
                $table->string('service', 500)->nullable()->after('schedules');
            }

            if (! Schema::hasColumn('schedules', 'details')) {
                $table->text('details')->nullable()->after('service');
            }

            if (! Schema::hasColumn('schedules', 'material_checklist')) {
                $table->json('material_checklist')->nullable()->after('details');
            }
        });
    }

    public function down(): void
    {
        Schema::table('schedules', function (Blueprint $table) {
            $columns = array_values(array_filter([
                Schema::hasColumn('schedules', 'material_checklist') ? 'material_checklist' : null,
                Schema::hasColumn('schedules', 'details') ? 'details' : null,
                Schema::hasColumn('schedules', 'service') ? 'service' : null,
            ]));

            if ($columns !== []) {
                $table->dropColumn($columns);
            }
        });
    }
};
