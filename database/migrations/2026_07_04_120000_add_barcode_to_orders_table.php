<?php

use App\Support\Ean13;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->string('barcode', 13)->nullable()->after('order_number');
        });

        DB::table('orders')
            ->select(['id', 'order_number'])
            ->orderBy('id')
            ->chunkById(500, function ($orders) {
                foreach ($orders as $order) {
                    DB::table('orders')
                        ->where('id', $order->id)
                        ->update(['barcode' => Ean13::fromNumber($order->order_number)]);
                }
            });

        Schema::table('orders', function (Blueprint $table) {
            $table->unique(['tenant_id', 'barcode'], 'orders_tenant_barcode_unique');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropUnique('orders_tenant_barcode_unique');
            $table->dropColumn('barcode');
        });
    }
};
