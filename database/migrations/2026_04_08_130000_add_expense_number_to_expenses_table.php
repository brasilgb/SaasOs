<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('expenses', function (Blueprint $table) {
            $table->unsignedInteger('expense_number')->nullable();
        });

        $expenses = DB::table('expenses')
            ->select('id', 'tenant_id')
            ->orderBy('tenant_id')
            ->orderBy('created_at')
            ->orderBy('id')
            ->get();

        $currentTenant = null;
        $counter = 0;

        foreach ($expenses as $expense) {
            if ($currentTenant !== $expense->tenant_id) {
                $currentTenant = $expense->tenant_id;
                $counter = 1;
            } else {
                $counter++;
            }

            DB::table('expenses')
                ->where('id', $expense->id)
                ->update(['expense_number' => $counter]);
        }

        Schema::table('expenses', function (Blueprint $table) {
            $table->unique(['tenant_id', 'expense_number']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('expenses', function (Blueprint $table) {
            $table->dropUnique(['tenant_id', 'expense_number']);
            $table->dropColumn('expense_number');
        });
    }
};

