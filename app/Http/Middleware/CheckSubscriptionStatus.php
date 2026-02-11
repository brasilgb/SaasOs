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
        $tenant = auth()->user()->tenant; // Assumindo relação User -> Tenant

        if (!$tenant) {
            return $next($request);
        }

        // 1. Plano Cortesia (ID 2) - Bypass total
        if ($tenant->plan_id == 2) {
            return $next($request);
        }

        // Verificação de Datas
        $expiresAt = Carbon::parse($tenant->expires_at);
        $now = Carbon::now();

        // Se ainda não expirou
        if ($expiresAt->isFuture()) {
            return $next($request);
        }

        // Se expirou, calcula dias de atraso
        $daysOverdue = floor($expiresAt->diffInDays(now()));

        // 2. Período de Graça (até 3 dias)
        if ($daysOverdue <= 3) {
            // Compartilha flag com Inertia para abrir o Modal, mas PERMITE o acesso
            Inertia::share('subscription_alert', [
                'status' => 'grace_period',
                'days_overdue' => $daysOverdue,
                'message' => 'Sua assinatura venceu. Regularize para evitar bloqueio.'
            ]);

            // Atualiza status no banco se necessário (opcional aqui para não onerar)
            if ($tenant->subscription_status !== 'expirado') {
                $tenant->update(['subscription_status' => 'expirado']);
            }

            return $next($request);
        }

        // No Middleware:
        $limitDate = $expiresAt->copy()->addDays(3);

        if (now()->greaterThan($limitDate)) {
            return redirect()->route('subscription.blocked');
        }

        // 3. Bloqueio Total (> 3 dias)
        // Se a rota já for a de bloqueio ou pagamento, permite passar para não gerar loop
        if ($request->routeIs('subscription.blocked') || $request->routeIs('subscription.pay') || $request->routeIs('logout')) {
            return $next($request);
        }

        $tenant->update(['subscription_status' => 'bloqueado']);

        // Redireciona para tela de bloqueio
        return redirect()->route('subscription.blocked');
    }
}
