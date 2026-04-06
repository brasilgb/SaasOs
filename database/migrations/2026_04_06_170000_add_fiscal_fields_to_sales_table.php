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
        Schema::table('sales', function (Blueprint $table) {
            $table->string('fiscal_document_number', 120)->nullable()->after('cancel_reason');
            $table->string('fiscal_document_key', 120)->nullable()->after('fiscal_document_number');
            $table->string('fiscal_document_url', 500)->nullable()->after('fiscal_document_key');
            $table->timestamp('fiscal_issued_at')->nullable()->after('fiscal_document_url');
            $table->foreignId('fiscal_registered_by')->nullable()->after('fiscal_issued_at')->constrained('users')->nullOnDelete();
            $table->text('fiscal_notes')->nullable()->after('fiscal_registered_by');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('sales', function (Blueprint $table) {
            $table->dropForeign(['fiscal_registered_by']);
            $table->dropColumn([
                'fiscal_document_number',
                'fiscal_document_key',
                'fiscal_document_url',
                'fiscal_issued_at',
                'fiscal_registered_by',
                'fiscal_notes',
            ]);
        });
    }
};
