<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->boolean('is_warranty_return')->default(false)->after('warranty_expires_at');
            $table->foreignId('warranty_source_order_id')
                ->nullable()
                ->after('is_warranty_return')
                ->constrained('orders')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropForeign(['warranty_source_order_id']);
            $table->dropColumn(['is_warranty_return', 'warranty_source_order_id']);
        });
    }
};
