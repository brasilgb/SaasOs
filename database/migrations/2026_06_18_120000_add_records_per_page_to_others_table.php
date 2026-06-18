<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('others', function (Blueprint $table) {
            $table->unsignedSmallInteger('records_per_page')->default(20)->after('navigation');
        });
    }

    public function down(): void
    {
        Schema::table('others', function (Blueprint $table) {
            $table->dropColumn('records_per_page');
        });
    }
};
