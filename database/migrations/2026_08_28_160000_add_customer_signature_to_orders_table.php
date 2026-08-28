<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            // O arquivo em si fica em storage/orders/{order_number}/signature.png (mesmo
            // padrão de storage/orders/{order_number}/{filename} já usado pelas fotos da OS),
            // então basta guardar quando foi capturada pra saber se existe e auditar.
            $table->timestamp('customer_signature_captured_at')->nullable()->after('feedback');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn('customer_signature_captured_at');
        });
    }
};
