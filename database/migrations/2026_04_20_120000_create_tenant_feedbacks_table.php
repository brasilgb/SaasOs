<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tenant_feedbacks', function (Blueprint $table) {
            $table->id();

            $table->foreignId('tenant_id')
                ->constrained('tenants')
                ->cascadeOnDelete();

            $table->uuid('feedback_token')->unique();
            $table->string('feedback_source', 40);
            $table->string('feedback_status', 20)->default('pending');

            $table->unsignedTinyInteger('feedback_rating')->nullable();
            $table->text('feedback_comment')->nullable();

            $table->timestamp('feedback_sent_at')->nullable();
            $table->timestamp('feedback_opened_at')->nullable();
            $table->timestamp('feedback_submitted_at')->nullable();
            $table->timestamp('feedback_expires_at')->nullable();

            $table->unsignedBigInteger('feedback_recovery_assigned_to')->nullable();
            $table->string('feedback_recovery_status', 30)->nullable();
            $table->text('feedback_recovery_notes')->nullable();
            $table->timestamp('feedback_recovery_updated_at')->nullable();

            $table->foreign('feedback_recovery_assigned_to')
                ->references('id')
                ->on('users')
                ->nullOnDelete();

            $table->index(['tenant_id', 'feedback_status']);
            $table->index(['feedback_source', 'feedback_status']);
            $table->index(['feedback_submitted_at']);
            $table->index(['feedback_recovery_status']);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tenant_feedbacks');
    }
};
