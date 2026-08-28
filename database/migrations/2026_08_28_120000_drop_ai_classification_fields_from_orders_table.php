<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Remove os campos de classificação por IA (integração n8n removida do projeto).
     */
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn([
                'ai_suggested_priority',
                'ai_suggested_category',
                'ai_classification_notes',
                'ai_classified_at',
            ]);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->string('ai_suggested_priority', 20)->nullable()->after('service_status');
            $table->string('ai_suggested_category', 100)->nullable()->after('ai_suggested_priority');
            $table->text('ai_classification_notes')->nullable()->after('ai_suggested_category');
            $table->timestamp('ai_classified_at')->nullable()->after('ai_classification_notes');
        });
    }
};
