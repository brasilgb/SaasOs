<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Inertia\Inertia;

class CheckSubscriptionStatus
{
    public function handle(Request $request, Closure $next)
    {
        $tenant = auth()->user()->tenant;

        if (!$tenant) {
            return $next($request);
        }

        // Plano Cortesia bypass
        if ($tenant->plan_id == 2) {
            return $next($request);
        }

        $expiresAt = Carbon::parse($tenant->expires_at);
        $graceLimit = $expiresAt->copy()->addDays(3);
        $now = now();

        // 1️⃣ Assinatura ativa
        if ($expiresAt->isFuture()) {

            if ($tenant->subscription_status !== 'active') {
                $tenant->update([
                    'subscription_status' => 'active'
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
                'message' => 'Sua assinatura venceu. Regularize para evitar bloqueio.'
            ]);

            if ($tenant->subscription_status !== 'expired') {
                $tenant->update([
                    'subscription_status' => 'expired'
                ]);
            }

            return $next($request);
        }

        // 3️⃣ Bloqueio total
        if (
            $request->routeIs('subscription.blocked') ||
            $request->routeIs('subscription.pay') ||
            $request->routeIs('logout')
        ) {
            return $next($request);
        }

        if ($tenant->subscription_status !== 'blocked') {
            $tenant->update([
                'subscription_status' => 'blocked'
            ]);
        }

        return redirect()->route('subscription.blocked');
    }
}