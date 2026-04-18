<?php

namespace App\Http\Middleware;

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

        if (! $tenant->expires_at) {
            if ($tenant->subscription_status !== 'active') {
                $tenant->update([
                    'subscription_status' => 'active',
                ]);
            }

            return $next($request);
        }

        $expiresAt = Carbon::parse($tenant->expires_at);
        $graceLimit = $expiresAt->copy()->addDays(3);
        $now = now();

        // 1️⃣ Assinatura ativa
        if ($expiresAt->isFuture()) {

            if ($tenant->subscription_status !== 'active') {
                $tenant->update([
                    'subscription_status' => 'active',
                ]);
            }

            return $next($request);
        }

        // 2️⃣ Grace period (até 3 dias)
        if ($now->lessThanOrEqualTo($graceLimit)) {

            $daysOverdue = $expiresAt->diffInDays($now);

            Inertia::share('subscription_alert', [
                'status' => 'grace_period',
                'days_overdue' => $daysOverdue,
                'message' => 'Sua assinatura venceu. Regularize para evitar bloqueio.',
            ]);

            if ($tenant->subscription_status !== 'expired') {
                $tenant->update([
                    'subscription_status' => 'expired',
                ]);
            }

            return $next($request);
        }

        // 3️⃣ Bloqueio total
        if (
            $request->routeIs('subscription.blocked') ||
            $request->routeIs('subscription.pay') ||
            $request->routeIs('subscription.generate_pix') ||
            $request->routeIs('logout')
        ) {
            return $next($request);
        }

        if ($tenant->subscription_status !== 'blocked') {
            $tenant->update([
                'subscription_status' => 'blocked',
            ]);
        }

        return redirect()->route('subscription.blocked');
    }
}
