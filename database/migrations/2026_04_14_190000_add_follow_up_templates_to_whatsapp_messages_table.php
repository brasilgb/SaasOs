<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('whatsapp_messages', function (Blueprint $table) {
            $table->text('budgetfollowup')->nullable()->after('defaultmessage');
            $table->text('pendingpayment')->nullable()->after('budgetfollowup');
        });
    }

    public function down(): void
    {
        Schema::table('whatsapp_messages', function (Blueprint $table) {
            $table->dropColumn(['budgetfollowup', 'pendingpayment']);
        });
    }
};
