<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('plans', function (Blueprint $table) {
            $table->unsignedTinyInteger('billing_months')->nullable()->after('value');
        });

        DB::table('plans')
            ->where(function ($query) {
                $query->whereNull('billing_months')
                    ->orWhere('billing_months', '<=', 0);
            })
            ->orderBy('id')
            ->get(['id', 'slug', 'name'])
            ->each(function ($plan): void {
                $text = mb_strtolower(trim(($plan->slug ?? '').' '.($plan->name ?? '')));
                $months = match (true) {
                    str_contains($text, 'anual'), str_contains($text, 'year') => 12,
                    str_contains($text, 'semestral'), str_contains($text, 'semiannual') => 6,
                    str_contains($text, 'trimestral'), str_contains($text, 'quarter') => 3,
                    str_contains($text, 'mensal'), str_contains($text, 'month') => 1,
                    preg_match('/(^|[^0-9])(12|6|3|1)($|[^0-9])/', $text, $matches) === 1 => (int) $matches[2],
                    default => 1,
                };

                DB::table('plans')->where('id', $plan->id)->update(['billing_months' => $months]);
            });
    }

    public function down(): void
    {
        Schema::table('plans', function (Blueprint $table) {
            $table->dropColumn('billing_months');
        });
    }
};
