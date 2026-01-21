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

        // 1. Permite acesso total para Super Admin (Root)
        if (!$user || $user->roles === 99) {
            return $next($request);
        }

        $tenant = $user->tenant;

        // 2. BLOQUEIO ADMINISTRATIVO (Campo: status)
        // Se o status for 0, a conta está suspensa manualmente por você.
        if ($tenant->status === 0) {
            Auth::logout(); // Desloga o usuário
            return redirect()->route('login')->withErrors([
                'email' => 'Esta conta foi suspensa. Entre em contato com o suporte.'
            ]);
        }

        // 3. BLOQUEIO POR PAGAMENTO (Campos: expires_at e subscription_status)
        // Se a data de expiração passou, redireciona para a tela do Pix.
        if ($tenant->expires_at && now()->gt($tenant->expires_at)) {
            
            // Evita loop infinito: se ele já estiver na tela de expiração ou tentando pagar, permite.
            if (!$request->routeIs('subscription.expired') && !$request->routeIs('logout')) {
                return redirect()->route('subscription.expired');
            }
        }

        return $next($request);
    }
}
