<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('schedules', function (Blueprint $table) {
            $table->string('service_closure_status', 20)->nullable()->after('material_checklist');
            $table->timestamp('service_closure_requested_at')->nullable()->after('service_closure_status');
            $table->foreignId('service_closure_requested_by')->nullable()->after('service_closure_requested_at')->constrained('users')->nullOnDelete();
            $table->decimal('service_closure_amount', 10, 2)->nullable()->after('service_closure_requested_by');
            $table->timestamp('service_closure_priced_at')->nullable()->after('service_closure_amount');
            $table->foreignId('service_closure_priced_by')->nullable()->after('service_closure_priced_at')->constrained('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('schedules', function (Blueprint $table) {
            $table->dropForeign(['service_closure_requested_by']);
            $table->dropForeign(['service_closure_priced_by']);
            $table->dropColumn([
                'service_closure_status',
                'service_closure_requested_at',
                'service_closure_requested_by',
                'service_closure_amount',
                'service_closure_priced_at',
                'service_closure_priced_by',
            ]);
        });
    }
};
