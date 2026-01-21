<?php

namespace App\Http\Controllers\App;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use App\Models\Admin\Plan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class PaymentController extends Controller
{
    public function expired()
    {
        $tenant = Auth::user()->tenant;
        $data = $this->generatePixData($tenant);
        return Inertia::render('auth/ExpiredSubscription', $data);
    }

    public function generatePixData(Tenant $tenant)
    {
        $token = config('services.mercadopago.token');

        // Exceção: Plano Cortesia (ID 2) não gera pagamento
        if ($tenant->getAttribute('plan') == 2) {
            return [
                'qr_code' => '',
                'qr_code_base64' => '',
                'payment_id' => null
            ];
        }

        // Obtém o valor do plano. Se não houver plano associado, usa um valor de fallback ou trata o erro.
        // Assumindo que $tenant->plan retorna o model Plan com a propriedade 'value'
        $plan = Plan::find($tenant->plan);
        $amount = $plan ? (float) $plan->value : 0.00;

        if ($amount <= 0) {
            // Defina um valor padrão ou lance uma exceção se o plano for gratuito/inválido
            $amount = 1.00; 
        }

        $data = [
            'transaction_amount' => $amount,
            'description' => 'Renovação Assinatura - ' . $tenant->name,
            'payment_method_id' => 'pix',
            'payer' => [
                'email' => $tenant->email,
                'first_name' => $tenant->name,
                'identification' => [
                    'type' => 'CNPJ', // Pode ajustar lógica para CPF se necessário
                    'number' => preg_replace('/[^0-9]/', '', $tenant->cnpj)
                ]
            ],
            'metadata' => [
                'tenant_id' => $tenant->id,
            ],
            'notification_url' => route('webhook.mercadopago'),
        ];

        $response = Http::withToken($token)->post('https://api.mercadopago.com/v1/payments', $data);

        if ($response->ok()) {
            $payment = $response->json();
            
            return [
                'qr_code' => $payment['point_of_interaction']['transaction_data']['qr_code'],
                'qr_code_base64' => $payment['point_of_interaction']['transaction_data']['qr_code_base64'],
                'payment_id' => $payment['id']
            ];
        }

        Log::error('Erro ao gerar Pix Mercado Pago', ['response' => $response->json()]);
        
        return [
            'qr_code' => '',
            'qr_code_base64' => '',
            'payment_id' => null
        ];
    }

    public function handleWebhook(Request $request)
    {
        // 1. O Mercado Pago envia o ID do pagamento no campo 'data.id'
        $paymentId = $request->input('data.id') ?? $request->input('id');

        if (!$paymentId) {
            return response()->json(['message' => 'ID não encontrado'], 200);
        }

        // 2. Consulta o status real no Mercado Pago para evitar fraudes
        // (Substitua pelo seu Token Real ou Variável de Ambiente)
        $token = config('services.mercadopago.token');
        $response = Http::withToken($token)->get("https://api.mercadopago.com/v1/payments/{$paymentId}");

        if ($response->ok()) {
            $paymentData = $response->json();

            // 3. Verifica se o pagamento foi aprovado
            if ($paymentData['status'] === 'approved') {

                // Aqui recuperamos o tenant_id que você deve enviar no 'metadata' ao criar o Pix
                $tenantId = $paymentData['metadata']['tenant_id'] ?? null;

                if ($tenantId) {
                    $tenant = Tenant::find($tenantId);

                    if ($tenant) {
                        // 4. ATUALIZAÇÃO DOS SEUS CAMPOS
                        $tenant->update([
                            'payment' => true,
                            'status' => 1, // Ativo
                            'subscription_status' => 'active',
                            'last_payment_id' => $paymentId,
                            // Soma 30 dias à data atual ou à data que já expiraria
                            'expires_at' => now()->addDays(30),
                        ]);

                        Log::info("Pagamento aprovado para o Tenant: {$tenantId}");
                    }
                }
            }
        }

        // O Mercado Pago exige que você retorne status 200 ou 201
        return response()->json(['status' => 'success'], 200);
    }
}
