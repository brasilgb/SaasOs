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

    private function generatePixData(Tenant $tenant): array
    {
        // Plano cortesia não gera pagamento
        if ((int) $tenant->plan === 2) {
            return [
                'qr_code' => '',
                'qr_code_base64' => '',
                'payment_id' => null,
            ];
        }

        $plan = Plan::find($tenant->plan);

        if (!$plan || $plan->value <= 0) {
            Log::error('Plano inválido para pagamento', [
                'tenant_id' => $tenant->id,
                'plan_id' => $tenant->plan,
            ]);

            return [
                'qr_code' => '',
                'qr_code_base64' => '',
                'payment_id' => null,
            ];
        }

        $token = config('services.mercadopago.token');

        $payload = [
            'transaction_amount' => (float) $plan->value,
            'description'        => 'Renovação Assinatura - ' . $tenant->name,
            'payment_method_id'  => 'pix',
            'payer' => [
                'email' => $tenant->email,
                'first_name' => $tenant->name,
                'identification' => [
                    'type'   => 'CNPJ',
                    'number' => preg_replace('/\D/', '', $tenant->cnpj),
                ],
            ],
            'metadata' => [
                'tenant_id' => $tenant->id,
                'plan_id'   => $plan->id,
            ],
            'notification_url' => config('services.mercadopago.webhook_url'),
        ];

        $response = Http::withToken($token)
            ->post('https://api.mercadopago.com/v1/payments', $payload);

        if (!$response->ok()) {
            Log::error('Erro ao gerar Pix Mercado Pago', [
                'response' => $response->json(),
            ]);

            return [
                'qr_code' => '',
                'qr_code_base64' => '',
                'payment_id' => null,
            ];
        }

        $payment = $response->json();

        return [
            'qr_code' => data_get($payment, 'point_of_interaction.transaction_data.qr_code'),
            'qr_code_base64' => data_get($payment, 'point_of_interaction.transaction_data.qr_code_base64'),
            'payment_id' => $payment['id'] ?? null,
        ];
    }

    public function handleWebhook(Request $request)
    {
        $paymentId = $request->input('data.id') ?? $request->input('id');

        if (!$paymentId) {
            Log::warning('Webhook recebido sem payment_id');
            return response()->json(['status' => 'ignored'], 200);
        }

        $token = config('services.mercadopago.token');

        $response = Http::withToken($token)
            ->get("https://api.mercadopago.com/v1/payments/{$paymentId}");

        if (!$response->ok()) {
            Log::error('Erro ao consultar pagamento', ['payment_id' => $paymentId]);
            return response()->json(['status' => 'error'], 200);
        }

        $payment = $response->json();

        if ($payment['status'] !== 'approved') {
            return response()->json(['status' => 'pending'], 200);
        }

        $tenantId = data_get($payment, 'metadata.tenant_id');

        if (!$tenantId) {
            Log::error('Pagamento aprovado sem tenant_id', ['payment_id' => $paymentId]);
            return response()->json(['status' => 'invalid'], 200);
        }

        $tenant = Tenant::find($tenantId);

        if (!$tenant) {
            Log::error('Tenant não encontrado', ['tenant_id' => $tenantId]);
            return response()->json(['status' => 'not_found'], 200);
        }

        // Idempotência
        if ($tenant->last_payment_id === $paymentId) {
            return response()->json(['status' => 'already_processed'], 200);
        }

        $plan = Plan::find($tenant->plan);

        if (
            !$plan ||
            (float) $payment['transaction_amount'] !== (float) $plan->value
        ) {
            Log::warning('Valor pago divergente', [
                'tenant_id' => $tenant->id,
                'expected' => $plan?->value,
                'paid' => $payment['transaction_amount'],
            ]);

            return response()->json(['status' => 'invalid_amount'], 200);
        }

        $baseDate = $tenant->expires_at && $tenant->expires_at->isFuture()
            ? $tenant->expires_at
            : now();

        $tenant->update([
            'payment'            => true,
            'status'             => 1,
            'subscription_status'=> 'active',
            'last_payment_id'    => $paymentId,
            'expires_at'         => $baseDate->addDays(30),
        ]);

        Log::info('Pagamento aprovado e assinatura renovada', [
            'tenant_id' => $tenant->id,
            'payment_id' => $paymentId,
        ]);

        return response()->json(['status' => 'success'], 200);
    }
}
