<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->unsignedSmallInteger('warranty_days')->nullable()->after('delivery_date');
            $table->timestamp('warranty_expires_at')->nullable()->after('warranty_days');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['warranty_days', 'warranty_expires_at']);
        });
    }
};
