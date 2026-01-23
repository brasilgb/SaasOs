<?php

namespace App\Http\Controllers\App;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use App\Models\Admin\Plan;
use App\Models\App\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class PaymentController extends Controller
{
    /* ===============================
       TELA DE ASSINATURA EXPIRADA
    ================================ */
    public function expired()
    {
        $tenant = Auth::user()->tenant;

        // 1. Não tem plano → força seleção
        if (!$tenant->plan) {
            return $this->renderPlanSelection();
        }

        $pix = $this->generatePixData($tenant);

        // 2. Caso o plano seja inválido
        if (!empty($pix['requires_plan'])) {
            return $this->renderPlanSelection();
        }

        return Inertia::render('auth/ExpiredSubscription', $pix);
    }

    private function renderPlanSelection()
    {
        return Inertia::render('auth/ExpiredSubscription', [
            'requires_plan' => true,
            'plans' => Plan::where('value', '>', 0)
                ->get(['id', 'name', 'value'])
        ]);
    }

    /* ===============================
       SELEÇÃO DE PLANO
    ================================ */
    public function selectPlan(Request $request)
    {
        $data = $request->validate([
            'plan_id' => ['required', 'exists:plans,id'],
        ]);

        $tenant = Auth::user()->tenant;

        $tenant->update([
            'plan' => $data['plan_id'],
        ]);

        return redirect()->route('subscription.expired');
    }

    /* ===============================
       STATUS DO PAGAMENTO (POLLING)
    ================================ */
    public function paymentStatus($paymentId)
    {
        $tenant = Auth::user()->tenant;

        return response()->json([
            'paid' =>
            $tenant->last_payment_id === $paymentId &&
                $tenant->subscription_status === 'active',
        ]);
    }

    /* ===============================
       GERAÇÃO DE PIX (IDEMPOTENTE)
    ================================ */
    private function generatePixData(Tenant $tenant): array
    {
        $plan = Plan::find($tenant->plan);

        if (!$plan || $plan->value <= 0) {
            return ['requires_plan' => true];
        }

        $idempotencyKey = 'pix_'.$tenant->id.'_'.$plan->id.'_'.now()->format('Ym');

        // Reutiliza Pix pendente SOMENTE do mesmo valor
        $pendingPayment = Payment::where('tenant_id', $tenant->id)
            ->where('status', 'pending')
            ->where('amount', $plan->value)
            ->latest()
            ->first();

        if ($pendingPayment) {
            return [
                'payment_id' => $pendingPayment->payment_id,
                'qr_code' => data_get(
                    $pendingPayment->raw_response,
                    'point_of_interaction.transaction_data.qr_code'
                ),
                'qr_code_base64' => data_get(
                    $pendingPayment->raw_response,
                    'point_of_interaction.transaction_data.qr_code_base64'
                ),
            ];
        }

        $token = config('services.mercadopago.token');

        if (!$token) {
            Log::critical('Token Mercado Pago não configurado');
            return [
                'error' => 'payment_unavailable',
            ];
        }

        $payload = [
            'transaction_amount' => (float) $plan->value,
            'description' => 'Renovação de Assinatura - ' . $tenant->name,
            'payment_method_id' => 'pix',
            'payer' => [
                'email' => $tenant->email,
                'first_name' => $tenant->name,
                'identification' => [
                    'type' => 'CNPJ',
                    'number' => preg_replace('/\D/', '', $tenant->cnpj),
                ],
            ],
            'metadata' => [
                'tenant_id' => $tenant->id,
                'plan_id' => $plan->id,
            ],
            'notification_url' => config('services.mercadopago.webhook_url'),
        ];

        $response = Http::withToken($token)
            ->withHeaders([
                'X-Idempotency-Key' => $idempotencyKey,
            ])
            ->timeout(15)
            ->post('https://api.mercadopago.com/v1/payments', $payload);

        if (!$response->ok()) {
            Log::error('Erro ao gerar Pix Mercado Pago', [
                'response' => $response->json(),
            ]);

            return [
                'error' => 'pix_generation_failed',
            ];
        }

        $payment = $response->json();

        Payment::create([
            'tenant_id' => $tenant->id,
            'payment_id' => $payment['id'],
            'amount' => $plan->value,
            'status' => 'pending',
            'idempotency_key' => $idempotencyKey,
            'raw_response' => $payment,
        ]);

        return [
            'payment_id' => $payment['id'],
            'qr_code' => data_get($payment, 'point_of_interaction.transaction_data.qr_code'),
            'qr_code_base64' => data_get($payment, 'point_of_interaction.transaction_data.qr_code_base64'),
        ];
    }
    /* ===============================
       WEBHOOK MERCADO PAGO
    ================================ */
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

        Payment::where('payment_id', $paymentId)->update([
            'status' => 'approved',
            'raw_response' => $payment,
        ]);

        $tenant->update([
            'payment' => true,
            'status' => 1,
            'subscription_status' => 'active',
            'last_payment_id' => $paymentId,
            'expires_at' => $baseDate->addDays(30),
        ]);

        Log::info('Pagamento aprovado e assinatura renovada', [
            'tenant_id' => $tenant->id,
            'payment_id' => $paymentId,
        ]);

        return response()->json(['status' => 'success'], 200);
    }
}
