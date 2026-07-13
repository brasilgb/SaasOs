<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('plan_leads', function (Blueprint $table) {
            $table->string('source', 30)->default('landing')->after('email');
            $table->string('status', 30)->default('new')->after('source');
            $table->text('notes')->nullable()->after('status');
            $table->timestamp('last_contact_at')->nullable()->after('notes');
        });
    }

    public function down(): void
    {
        Schema::table('plan_leads', function (Blueprint $table) {
            $table->dropColumn(['source', 'status', 'notes', 'last_contact_at']);
        });
    }
};
