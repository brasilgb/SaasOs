<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->string('service_type', 150)->nullable()->after('defect');
            $table->text('service_details')->nullable()->after('service_type');
            $table->text('materials_used')->nullable()->after('service_details');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['service_type', 'service_details', 'materials_used']);
        });
    }
};
