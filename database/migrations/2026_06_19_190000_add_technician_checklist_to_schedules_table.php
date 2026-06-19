<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('schedules', function (Blueprint $table) {
            $table->json('technician_checklist')->nullable()->after('material_checklist');
            $table->json('technician_checklist_items')->nullable()->after('technician_checklist');
            $table->timestamp('technician_checklist_completed_at')->nullable()->after('technician_checklist_items');
        });
    }

    public function down(): void
    {
        Schema::table('schedules', function (Blueprint $table) {
            $table->dropColumn([
                'technician_checklist',
                'technician_checklist_items',
                'technician_checklist_completed_at',
            ]);
        });
    }
};
