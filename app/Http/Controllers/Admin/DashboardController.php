<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use App\Models\User;
use Carbon\Carbon;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $today = Carbon::today();
        $nextWeek = Carbon::today()->addDays(7)->endOfDay();

        $users = User::query()
            ->where('roles', 9)
            ->orWhereNull('roles')
            ->get();

        $companies = Tenant::query()
            ->with('plan')
            ->get();

        $activeSubscriptions = $companies->filter(function (Tenant $tenant) use ($today) {
            return $tenant->subscriptionBucket($today) === Tenant::SUBSCRIPTION_ACTIVE;
        });

        $graceSubscriptions = $companies->filter(function (Tenant $tenant) use ($today) {
            return $tenant->subscriptionBucket($today) === Tenant::SUBSCRIPTION_GRACE;
        });

        $blockedSubscriptions = $companies->filter(function (Tenant $tenant) use ($today) {
            return $tenant->subscriptionBucket($today) === Tenant::SUBSCRIPTION_BLOCKED;
        });

        $expiresToday = $companies->filter(function (Tenant $tenant) use ($today) {
            return $tenant->expires_at?->isSameDay($today) ?? false;
        });

        $expiresNextSevenDays = $companies->filter(function (Tenant $tenant) use ($today, $nextWeek) {
            if (! $tenant->expires_at) {
                return false;
            }

            return $tenant->expires_at->betweenIncluded($today, $nextWeek);
        });
        $withoutPlan = $companies->filter(function (Tenant $tenant) {
            return ! $tenant->plan_id;
        });
        $withoutExpiration = $companies->filter(function (Tenant $tenant) {
            return ! $tenant->expires_at;
        });

        $attentionTenants = $companies
            ->filter(function (Tenant $tenant) use ($nextWeek) {
                if (! $tenant->plan_id) {
                    return true;
                }

                if (! $tenant->expires_at) {
                    return true;
                }

                return $tenant->expires_at->lessThanOrEqualTo($nextWeek);
            })
            ->sortBy(function (Tenant $tenant) {
                return sprintf(
                    '%02d-%020d',
                    $tenant->attentionPriority($today),
                    $tenant->expires_at?->timestamp ?? PHP_INT_MAX
                );
            })
            ->take(8)
            ->values()
            ->map(function (Tenant $tenant) use ($today) {
                return [
                    'id' => $tenant->id,
                    'company' => $tenant->company,
                    'contact' => $tenant->name,
                    'plan' => $tenant->plan?->name ?? 'Sem plano',
                    'expires_at' => $tenant->expires_at?->format('Y-m-d'),
                    'attention_label' => $tenant->attentionLabel($today),
                ];
            });

        $metrics = [
            'users' => $users,
            'companies' => $companies,
            'subscription_kpis' => [
                'active' => $activeSubscriptions->count(),
                'grace' => $graceSubscriptions->count(),
                'blocked' => $blockedSubscriptions->count(),
                'expires_today' => $expiresToday->count(),
                'expires_next_7_days' => $expiresNextSevenDays->count(),
                'without_plan' => $withoutPlan->count(),
                'without_expiration' => $withoutExpiration->count(),
            ],
            'attention_tenants' => $attentionTenants,
        ];

        return Inertia::render('admin/dashboard/index', ['metrics' => $metrics]);
    }
}
