<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $driver = DB::connection()->getDriverName();

        if ($driver === 'mysql') {
            DB::statement('ALTER TABLE part_movements MODIFY movement_type VARCHAR(30) NOT NULL');
        } elseif ($driver === 'pgsql') {
            DB::statement('ALTER TABLE part_movements ALTER COLUMN movement_type TYPE VARCHAR(30)');
        }

        if (! Schema::hasTable('part_movements')) {
            return;
        }

        DB::table('part_movements')
            ->where('movement_type', 'saida')
            ->where('reason', 'like', 'Uso na OS%')
            ->update(['movement_type' => 'uso_os']);

        DB::table('part_movements')
            ->where('movement_type', 'saida')
            ->where('reason', 'like', 'Venda %')
            ->update(['movement_type' => 'venda']);

        DB::table('part_movements')
            ->where('movement_type', 'entrada')
            ->where(function ($query) {
                $query->where('reason', 'like', 'Devolução de peça%')
                    ->orWhere('reason', 'like', 'Cancelamento da venda%');
            })
            ->update(['movement_type' => 'devolucao']);

        DB::table('part_movements')
            ->whereIn('reason', ['Ajuste de estoque', 'Exclusão de peça'])
            ->update(['movement_type' => 'ajuste']);

        DB::table('part_movements')
            ->where('movement_type', 'saida')
            ->update(['movement_type' => 'ajuste']);
    }

    public function down(): void
    {
        DB::table('part_movements')
            ->whereIn('movement_type', ['uso_os', 'venda', 'ajuste'])
            ->update(['movement_type' => 'saida']);

        DB::table('part_movements')
            ->where('movement_type', 'devolucao')
            ->update(['movement_type' => 'entrada']);

        $driver = DB::connection()->getDriverName();

        if ($driver === 'mysql') {
            DB::statement("ALTER TABLE part_movements MODIFY movement_type ENUM('entrada', 'saida') NOT NULL");
        }
    }
};
