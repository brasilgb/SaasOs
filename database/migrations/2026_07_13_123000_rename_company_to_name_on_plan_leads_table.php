<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('plan_leads', function (Blueprint $table) {
            $table->renameColumn('company', 'name');
        });
    }

    public function down(): void
    {
        Schema::table('plan_leads', function (Blueprint $table) {
            $table->renameColumn('name', 'company');
        });
    }
};
