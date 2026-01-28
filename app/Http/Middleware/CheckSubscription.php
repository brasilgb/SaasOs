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

        if (!$user) {
            return redirect()->route('login');
        }

        // ROOT nunca bloqueia
        if ((int) $user->roles === 99) {
            return $next($request);
        }

        $tenant = $user->tenant;

        if (!$tenant) {
            Auth::logout();
            return redirect()->route('login');
        }

        /*
        |--------------------------------------------------------------------------
        | Rotas liberadas SEMPRE
        |--------------------------------------------------------------------------
        */
        if (
            $request->routeIs('payment.status') ||
            $request->routeIs('payment.select-plan') ||
            $request->routeIs('subscription.expired') ||
            $request->routeIs('webhook.mercadopago') ||
            $request->routeIs('logout') ||
            $request->is('webhook/*')
        ) {
            return $next($request);
        }

        /*
        |--------------------------------------------------------------------------
        | Bloqueio administrativo
        |--------------------------------------------------------------------------
        */
        if ((int) $tenant->status === 0) {
            Auth::logout();

            return redirect()
                ->route('login')
                ->withErrors([
                    'email' => 'Conta suspensa. Entre em contato com o suporte.',
                ]);
        }

        /*
        |--------------------------------------------------------------------------
        | EXPIRAÇÃO — ÚNICA REGRA QUE BLOQUEIA
        |--------------------------------------------------------------------------
        */

        // expires_at null = trial / lifetime → OK
        if ($tenant->expires_at && $tenant->expires_at->isPast()) {
            return redirect()->route('subscription.expired');
        }

        /*
        |--------------------------------------------------------------------------
        | Acesso liberado
        |--------------------------------------------------------------------------
        */
        return $next($request);
    }
}
