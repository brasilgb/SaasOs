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

        // Middleware deve rodar apenas com usuário autenticado
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
        $isExpired = $tenant->expires_at && now()->gt($tenant->expires_at);
        $isInactive = $tenant->subscription_status !== 'active';

        if ($isExpired || $isInactive) {

            // Evita loop infinito
            if (
                !$request->routeIs('subscription.expired') &&
                !$request->routeIs('logout') &&
                !$request->is('webhook/*') &&
                !$request->expectsJson()
            ) {
                return redirect()->route('subscription.expired');
            }
        }

        return $next($request);
    }
}
