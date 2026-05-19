<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('others', function (Blueprint $table) {
            $table->boolean('enable_finance')->default(false)->after('enablesales');
        });

        DB::table('others')->update([
            'enable_finance' => DB::raw('enablesales'),
        ]);
    }

    public function down(): void
    {
        Schema::table('others', function (Blueprint $table) {
            $table->dropColumn('enable_finance');
        });
    }
};
