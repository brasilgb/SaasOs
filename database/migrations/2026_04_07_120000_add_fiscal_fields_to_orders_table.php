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
            $table->string('fiscal_document_number', 120)->nullable();
            $table->string('fiscal_document_key', 120)->nullable();
            $table->string('fiscal_document_url', 500)->nullable();
            $table->timestamp('fiscal_issued_at')->nullable();
            $table->foreignId('fiscal_registered_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('fiscal_notes')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
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

