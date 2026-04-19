<?php

use App\Models\Admin\Plan;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::table('tenants')
            ->whereNotNull('plan_id')
            ->whereNull('period_id')
            ->orderBy('id')
            ->chunkById(100, function ($tenants) {
                $planIds = $tenants->pluck('plan_id')->filter()->unique()->values();
                $plans = Plan::query()
                    ->with('periods')
                    ->whereIn('id', $planIds)
                    ->get()
                    ->keyBy('id');

                foreach ($tenants as $tenant) {
                    $plan = $plans->get($tenant->plan_id);
                    $periodId = $plan?->preferredPeriod()?->id;

                    if (! $periodId) {
                        continue;
                    }

                    DB::table('tenants')
                        ->where('id', $tenant->id)
                        ->update([
                            'period_id' => $periodId,
                            'updated_at' => now(),
                        ]);
                }
            });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Intentionally left blank to avoid removing period selections
        // that may have been adjusted manually after this backfill.
    }
};
