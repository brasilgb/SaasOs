<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('plans')->where('slug', 'mensal')->update([
            'name' => 'Mensal',
            'value' => 49.90,
            'billing_months' => 1,
            'description' => 'Acesso completo ao VetorOS por 1 mês.',
            'updated_at' => now(),
        ]);

        DB::table('plans')->updateOrInsert(
            ['slug' => 'anual'],
            [
                'name' => 'Anual',
                'value' => 419.16,
                'billing_months' => 12,
                'description' => 'Acesso completo ao VetorOS por 12 meses com 30% de desconto.',
                'updated_at' => now(),
                'created_at' => now(),
            ],
        );

        DB::table('plans')->whereIn('slug', ['trimestral', 'semestral'])->update([
            'value' => 0,
            'updated_at' => now(),
        ]);
    }

    public function down(): void
    {
        DB::table('plans')->where('slug', 'anual')->delete();
        DB::table('plans')->where('slug', 'trimestral')->update(['value' => 134.90, 'updated_at' => now()]);
        DB::table('plans')->where('slug', 'semestral')->update(['value' => 239.90, 'updated_at' => now()]);
    }
};
