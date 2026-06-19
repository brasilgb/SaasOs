<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('schedules', function (Blueprint $table) {
            $table->text('technician_diagnosis')->nullable()->after('material_checklist');
            $table->text('technician_solution')->nullable()->after('technician_diagnosis');
            $table->text('technician_observations')->nullable()->after('technician_solution');
            $table->timestamp('technician_report_updated_at')->nullable()->after('technician_observations');
        });
    }

    public function down(): void
    {
        Schema::table('schedules', function (Blueprint $table) {
            $table->dropColumn([
                'technician_diagnosis',
                'technician_solution',
                'technician_observations',
                'technician_report_updated_at',
            ]);
        });
    }
};
