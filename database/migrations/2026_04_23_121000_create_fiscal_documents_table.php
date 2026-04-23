<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('fiscal_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->morphs('documentable');
            $table->string('type', 20);
            $table->string('provider', 50)->default('manual');
            $table->string('environment', 20)->nullable();
            $table->string('provider_reference', 120)->nullable();
            $table->string('number', 120)->nullable();
            $table->string('series', 20)->nullable();
            $table->string('access_key', 160)->nullable();
            $table->string('status', 30)->default('registered');
            $table->string('pdf_url', 500)->nullable();
            $table->string('xml_url', 500)->nullable();
            $table->timestamp('issued_at')->nullable();
            $table->foreignId('registered_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('notes')->nullable();
            $table->json('request_payload')->nullable();
            $table->json('response_payload')->nullable();
            $table->text('error_message')->nullable();
            $table->timestamps();

            $table->index(['tenant_id', 'type', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('fiscal_documents');
    }
};
