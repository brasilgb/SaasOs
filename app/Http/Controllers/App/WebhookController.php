<?php

namespace App\Http\Controllers\App;

use App\Http\Controllers\Controller;
use App\Models\Admin\Plan;
use App\Models\Tenant;
use Illuminate\Http\Request;
use MercadoPago\Client\Payment\PaymentClient;
use Illuminate\Support\Facades\Log;
use MercadoPago\MercadoPagoConfig;

class WebhookController extends Controller
{
    public function handle(Request $request, $token)
    {
        // 1ª CAMADA: Validação do Token da URL
        if ($token !== config('services.mercadopago.webhook_token')) {
            Log::warning('Tentativa de acesso não autorizado ao Webhook.', ['token' => $token]);
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        // 2ª CAMADA: Filtragem do evento
        // O MP envia notificações de diversos tipos. Queremos apenas 'payment'
        $type = $request->input('type') ?? $request->input('topic');
        
        if ($type !== 'payment') {
            return response()->json(['status' => 'ignored']);
        }

        $paymentId = $request->input('data.id') ?? $request->input('id');

        if (!$paymentId) {
            return response()->json(['error' => 'ID missing'], 400);
        }

        try {
            MercadoPagoConfig::setAccessToken(config('services.mercadopago.token'));
            $client = new PaymentClient();

            // 3ª CAMADA (A MAIS IMPORTANTE): Consulta Direta
            // Nós ignoramos o status que veio no POST e buscamos o status real na API do MP
            $payment = $client->get($paymentId);

            if ($payment->status === 'approved') {
                return $this->processApproval($payment);
            }

            return response()->json(['status' => 'processed_not_approved']);

        } catch (\Exception $e) {
            Log::error('Erro ao processar Webhook MP: ' . $e->getMessage());
            return response()->json(['error' => 'Internal Server Error'], 500);
        }
    }

    private function processApproval($payment)
    {
        // Recuperamos os dados que enviamos na criação do PIX (external_reference)
        $metadata = json_decode($payment->external_reference);
        
        if (!$metadata || !isset($metadata->tenant_id)) {
            Log::error('Pagamento aprovado sem metadados válidos.', ['payment_id' => $payment->id]);
            return response()->json(['error' => 'Invalid metadata'], 422);
        }

        $tenant = Tenant::find($metadata->tenant_id);
        $plan = Plan::find($metadata->plan_id);

        if ($tenant && $plan) {
            // Evita processar o mesmo pagamento duas vezes
            if ($tenant->last_payment_id == $payment->id) {
                return response()->json(['status' => 'already_updated']);
            }

            $months = match((int)$plan->id) {
                3 => 1,
                4 => 3,
                5 => 6,
                default => 0
            };

            // Se o usuário já estiver ativo, soma no tempo restante. 
            // Se estiver bloqueado/expirado, começa a contar de hoje.
            $startBase = ($tenant->expires_at && $tenant->expires_at->isFuture()) 
                ? $tenant->expires_at 
                : now();

            $tenant->update([
                'plan_id' => $plan->id,
                'subscription_status' => 'active',
                'expires_at' => $startBase->addMonths($months),
                'last_payment_id' => $payment->id,
                'status' => 1 // Garante que o tenant está habilitado
            ]);

            Log::info("Tenant {$tenant->name} renovado via PIX. Plano: {$plan->name}");
            return response()->json(['status' => 'success']);
        }

        return response()->json(['error' => 'Tenant or Plan not found'], 404);
    }
}