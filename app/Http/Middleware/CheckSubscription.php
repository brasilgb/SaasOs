<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class CheckSubscription
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = Auth::user();

        // Se não estiver logado ou for Root (roles == 99), permite passar
        if (!$user || $user->roles === 99) {
            return $next($request);
        }

        $tenant = $user->tenant;

        // Se for Plano Cortesia (ID 2), não verifica expiração
        if ($tenant && $tenant->getAttribute('plan') === 2) {
            return $next($request);
        }

        // Verifica se o campo expires_at já passou da data/hora atual
        if ($tenant && $tenant->expires_at && now()->gt($tenant->expires_at)) {
            
            // Se for uma requisição Inertia/Web, redireciona para página de renovação
            return redirect()->route('subscription.expired')
                ->with('error', 'Sua assinatura expirou. Por favor, realize o pagamento via Pix.');
        }

        return $next($request);
    }
}
