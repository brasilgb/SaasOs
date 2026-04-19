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
        Schema::table('tenants', function (Blueprint $table) {
            $table->string('last_subscription_notice_key', 100)->nullable()->after('last_payment_id');
            $table->timestamp('last_subscription_notice_sent_at')->nullable()->after('last_subscription_notice_key');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tenants', function (Blueprint $table) {
            $table->dropColumn(['last_subscription_notice_key', 'last_subscription_notice_sent_at']);
        });
    }
};
