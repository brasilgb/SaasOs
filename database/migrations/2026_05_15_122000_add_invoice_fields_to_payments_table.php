<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->foreignId('admin_fiscal_document_id')->nullable()->after('raw_response')->constrained('admin_fiscal_documents')->nullOnDelete();
            $table->string('invoice_email')->nullable()->after('admin_fiscal_document_id');
            $table->timestamp('invoice_email_sent_at')->nullable()->after('invoice_email');
            $table->text('invoice_email_error')->nullable()->after('invoice_email_sent_at');
        });
    }

    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropForeign(['admin_fiscal_document_id']);
            $table->dropColumn([
                'admin_fiscal_document_id',
                'invoice_email',
                'invoice_email_sent_at',
                'invoice_email_error',
            ]);
        });
    }
};
