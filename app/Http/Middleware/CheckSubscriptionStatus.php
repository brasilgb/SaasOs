<?php

namespace App\Http\Middleware;

use App\Models\Tenant;
use Carbon\Carbon;
use Closure;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CheckSubscriptionStatus
{
    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();
        $tenant = $user?->tenant;

        if (! $tenant) {
            return $next($request);
        }

        $persistedStatus = $tenant->persistedSubscriptionStatus();
        if ($tenant->subscription_status !== $persistedStatus) {
            $tenant->update([
                'subscription_status' => $persistedStatus,
            ]);
        }

        $bucket = $tenant->subscriptionBucket();
        if ($bucket === Tenant::SUBSCRIPTION_ACTIVE) {
            return $next($request);
        }

        $now = now();
        if ($bucket === Tenant::SUBSCRIPTION_GRACE) {
            $expiresAt = Carbon::parse($tenant->expires_at);
            $daysOverdue = $expiresAt->diffInDays($now);

            Inertia::share('subscription_alert', [
                'status' => 'grace_period',
                'days_overdue' => $daysOverdue,
                'message' => 'Sua assinatura venceu. Regularize para evitar bloqueio.',
            ]);

            return $next($request);
        }

        if (
            $request->routeIs('subscription.blocked') ||
            $request->routeIs('subscription.pay') ||
            $request->routeIs('subscription.generate_pix') ||
            $request->routeIs('logout')
        ) {
            return $next($request);
        }

        return redirect()->route('subscription.blocked');
    }
}
