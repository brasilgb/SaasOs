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

        if ($tenant->subscriptionBucket() === \App\Models\Tenant::SUBSCRIPTION_ACTIVE) {
            return redirect()->route('app.dashboard');
        }

        // Busca apenas planos cobraveis, excluindo Trial e planos sem valor.
        $plans = Plan::query()
            ->get()
            ->filter(fn (Plan $plan) => ! $plan->isTrial() && (float) $plan->value > 0)
            ->values();

        return Inertia::render('Subscription/Blocked', [
            'plans' => $plans,
            'tenant' => $tenant,
        ]);
    }

    // Endpoint leve para o Frontend verificar se o pagamento caiu
    public function checkStatus()
    {
        $status = auth()->user()->tenant->persistedSubscriptionStatus();

        return response()->json([
            'status' => $status,
        ]);
    }
}
