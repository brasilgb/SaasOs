<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('parts', function (Blueprint $table) {
            $table->dropUnique('parts_part_number_unique');
            $table->dropUnique('parts_reference_number_unique');

            $table->unique(['tenant_id', 'part_number'], 'parts_tenant_part_number_unique');
            $table->unique(['tenant_id', 'reference_number'], 'parts_tenant_reference_number_unique');
        });
    }

    public function down(): void
    {
        Schema::table('parts', function (Blueprint $table) {
            $table->dropUnique('parts_tenant_part_number_unique');
            $table->dropUnique('parts_tenant_reference_number_unique');

            $table->unique('part_number', 'parts_part_number_unique');
            $table->unique('reference_number', 'parts_reference_number_unique');
        });
    }
};
