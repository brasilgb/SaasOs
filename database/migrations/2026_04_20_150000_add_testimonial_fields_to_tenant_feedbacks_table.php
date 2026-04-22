<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tenant_feedbacks', function (Blueprint $table) {
            $table->timestamp('testimonial_consent_at')->nullable()->after('feedback_recovery_updated_at');
            $table->string('testimonial_status', 30)->nullable()->after('testimonial_consent_at');
            $table->string('testimonial_public_name', 120)->nullable()->after('testimonial_status');
            $table->string('testimonial_public_role', 120)->nullable()->after('testimonial_public_name');
            $table->text('testimonial_excerpt')->nullable()->after('testimonial_public_role');
            $table->timestamp('testimonial_published_at')->nullable()->after('testimonial_excerpt');

            $table->index(['testimonial_status']);
        });
    }

    public function down(): void
    {
        Schema::table('tenant_feedbacks', function (Blueprint $table) {
            $table->dropIndex(['testimonial_status']);
            $table->dropColumn([
                'testimonial_consent_at',
                'testimonial_status',
                'testimonial_public_name',
                'testimonial_public_role',
                'testimonial_excerpt',
                'testimonial_published_at',
            ]);
        });
    }
};
