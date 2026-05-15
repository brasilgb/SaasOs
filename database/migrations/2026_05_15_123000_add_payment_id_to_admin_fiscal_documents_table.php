<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('admin_fiscal_documents', 'payment_id')) {
            Schema::table('admin_fiscal_documents', function (Blueprint $table) {
                $table->foreignId('payment_id')->nullable()->after('tenant_id')->constrained('payments')->nullOnDelete();
                $table->index('payment_id');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('admin_fiscal_documents', 'payment_id')) {
            Schema::table('admin_fiscal_documents', function (Blueprint $table) {
                $table->dropForeign(['payment_id']);
                $table->dropIndex(['payment_id']);
                $table->dropColumn('payment_id');
            });
        }
    }
};
