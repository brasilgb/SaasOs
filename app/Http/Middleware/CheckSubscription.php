<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class CheckSubscription
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = Auth::user();

        // Deve rodar apenas com usuário autenticado
        if (!$user) {
            return redirect()->route('login');
        }

        // Super Admin (Root)
        if ((int) $user->roles === 99) {
            return $next($request);
        }

        $tenant = $user->tenant;

        if (!$tenant) {
            Auth::logout();
            return redirect()->route('login');
        }

        // 🔓 Rotas técnicas nunca devem ser bloqueadas
        if (
            $request->routeIs('payment.status') ||
            $request->is('webhook/*')
        ) {
            return $next($request);
        }

        // 1. BLOQUEIO ADMINISTRATIVO
        if ((int) $tenant->status === 0) {
            Auth::logout();

            return redirect()
                ->route('login')
                ->withErrors([
                    'email' => 'Esta conta foi suspensa. Entre em contato com o suporte.',
                ]);
        }

        // 2. BLOQUEIO POR ASSINATURA
        $isExpired = !is_null($tenant->expires_at) && now()->greaterThan($tenant->expires_at);
        $isInactive = $tenant->subscription_status !== 'active';

        if ($isExpired || $isInactive) {

            // Rotas permitidas durante o bloqueio
            if (
                !$request->routeIs('subscription.expired') &&
                !$request->routeIs('subscription.select-plan') &&
                !$request->routeIs('logout')
            ) {
                return redirect()->route('subscription.expired');
            }
        }

        return $next($request);
    }
}
