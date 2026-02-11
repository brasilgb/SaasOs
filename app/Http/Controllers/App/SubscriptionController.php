<?php

namespace App\Http\Controllers\App;

use App\Http\Controllers\Controller;
use App\Models\Admin\Plan;
use Inertia\Inertia;

class SubscriptionController extends Controller
{
    // Renderiza a tela de bloqueio
    public function blocked()
    {
        $tenant = auth()->user()->tenant;

        // Segurança: Se o usuário NÃO estiver bloqueado nem expirado há > 3 dias, manda pro dashboard
        // Isso previne que alguém acesse a url /subscription/blocked manualmente estando ativo
        if ($tenant->subscription_status === 'active' || $tenant->plan_id == 2) {
            return redirect()->route('app.dashboard');
        }

        // Busca apenas planos pagos (Exclui Trial e Cortesia)
        $plans = Plan::whereNotIn('id', [1, 2])->get();

        return Inertia::render('Subscription/Blocked', [
            'plans' => $plans,
            'tenant' => $tenant
        ]);
    }

    // Endpoint leve para o Frontend verificar se o pagamento caiu
    public function checkStatus()
    {
        // Buscamos apenas o campo necessário para performance
    $status = auth()->user()->tenant->subscription_status;

        // O status é atualizado via Webhook (configurado anteriormente), 
        // então aqui só lemos o banco.
        return response()->json([
            'status' => $status
        ]);
    }
}