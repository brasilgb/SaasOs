<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->string('technician_local_payment_status', 20)
                ->nullable()
                ->after('technician_local_payment_received');
        });

        DB::table('orders')
            ->where('technician_local_payment_received', true)
            ->whereNull('technician_local_payment_status')
            ->update(['technician_local_payment_status' => 'confirmed']);
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn('technician_local_payment_status');
        });
    }
};
