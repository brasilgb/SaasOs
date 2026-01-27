<?php

namespace App\Http\Controllers\App;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use App\Models\Admin\Plan;
use App\Models\App\Payment;
use Carbon\Carbon;
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

        if (!$tenant->plan) {
            return $this->renderPlanSelection();
        }

        $pix = $this->generatePixData($tenant);

        if (!empty($pix['requires_plan'])) {
            return $this->renderPlanSelection();
        }

        return Inertia::render('auth/ExpiredSubscription', $pix);
    }

    public function payInAdvance()
    {
        return Inertia::render('app/payment/index', [
            'requires_plan' => true,
            'plans' => Plan::where('value', '>', 0)->get(['id', 'name', 'value']),
        ]);
    }

    private function renderPlanSelection()
    {
        return Inertia::render('auth/ExpiredSubscription', [
            'requires_plan' => true,
            'plans' => Plan::where('value', '>', 0)->get(['id', 'name', 'value']),
        ]);
    }

    /* ===============================
       SELEÇÃO DE PLANO
    ================================ */
    public function selectPlan(Request $request)
    {
        $data = $request->validate([
            'plan_id' => ['required', 'exists:plans,id'],
            'source' => ['sometimes', 'in:pay-in-advance'],
        ]);

        $tenant = Auth::user()->tenant;

        $tenant->update([
            'plan' => $data['plan_id'],
        ]);

        if ($request->input('source') === 'pay-in-advance') {
            return back()->with(
                $this->generatePixData($tenant)
            );
        }

        return redirect()->route('subscription.expired');
    }

    /* ===============================
       STATUS DO PAGAMENTO (POLLING)
    ================================ */
    public function paymentStatus($paymentId)
    {
        $tenant = Auth::user()->tenant;

        $payment = Payment::where('payment_id', $paymentId)
            ->where('tenant_id', $tenant->id)
            ->first();

        return response()->json([
            'paid' => $payment?->status === 'approved',
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

        // 🔒 Idempotência REAL (determinística)
        $idempotencyKey = 'pix_' . $tenant->id . '_' . $plan->id . '_subscription';

        // Reutiliza PIX pendente válido
        $pendingPayment = Payment::where('idempotency_key', $idempotencyKey)
            ->where('status', 'pending')
            ->latest()
            ->first();

        if ($pendingPayment) {
            $expirationDate = Carbon::parse(
                data_get($pendingPayment->raw_response, 'date_of_expiration')
            );

            if ($expirationDate && $expirationDate->isFuture()) {
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

            Log::info('PIX expirado cancelado', [
                'payment_id' => $pendingPayment->payment_id,
            ]);

            $pendingPayment->update(['status' => 'cancelled']);
        }

        $token = config('services.mercadopago.token');

        if (!$token) {
            Log::critical('Token Mercado Pago não configurado');
            return ['error' => 'payment_unavailable'];
        }

        $cnpj = preg_replace('/\D/', '', $tenant->cnpj);
        $docType = strlen($cnpj) === 14 ? 'CNPJ' : 'CPF';

        if (!in_array(strlen($cnpj), [11, 14])) { // Verifica se o CNPJ/CPF tem 11 (CPF) ou 14 (CNPJ) dígitos
            Log::error('CNPJ/CPF inválido para geração de Pix.', ['tenant_id' => $tenant->id, 'cnpj_raw' => $tenant->cnpj, 'cnpj_cleaned' => $cnpj]);
            return ['error' => 'invalid_document_number'];
        }

        $expiration = now()->addMinutes(30)->format('Y-m-d\TH:i:s.vP');
        $payload = [
            'transaction_amount' => (float) $plan->value,
            'description' => 'Renovação de Assinatura - ' . $tenant->name,
            'payment_method_id' => 'pix',
            'external_reference' => $idempotencyKey,
            'payer' => [
                'email' => $tenant->email,
                'first_name' => $tenant->name,
                'identification' => [
                    'type' => $docType,
                    'number' => $cnpj,
                ],
            ],
            'metadata' => [
                'tenant_id' => $tenant->id,
                'plan_id' => $plan->id,
            ],
            'notification_url' => config('services.mercadopago.webhook_url'),
            'date_of_expiration' => $expiration,
        ];

        $response = Http::withToken($token)
            ->withHeaders([
                'X-Idempotency-Key' => $idempotencyKey,
            ])
            ->timeout(15)
            ->post('https://api.mercadopago.com/v1/payments', $payload);

        if (!$response->ok()) {
            $errorData = $response->json();
            Log::error('Erro ao gerar Pix Mercado Pago', [
                'status' => $response->status(),
                'response' => $errorData,
                'raw_response' => $response->body(),
            ]);

            return [
                'error' => 'pix_generation_failed',
                'message' => data_get(
                    $errorData,
                    'message',
                    'A operadora recusou o pagamento. Verifique seus dados ou tente mais tarde.'
                ),
            ];
        }

                        $payment = $response->json();

                

                        $qrCodeBase64 = data_get($payment, 'point_of_interaction.transaction_data.qr_code_base64');

                

                        // Valida se o QR Code foi realmente retornado na resposta da API

                        if (!$qrCodeBase64) {

                            Log::error('PIX gerado sem qr_code_base64 na resposta da API', [

                                'payment_response' => $payment,

                                'tenant_id' => $tenant->id,

                            ]);

                

                            return [

                                'error' => 'pix_generation_failed',

                                'message' => 'Não foi possível obter o QR Code da operadora. Por favor, tente novamente em alguns instantes.',

                            ];

                        }

                

                        // Verifica se o pagamento foi criado, mas rejeitado imediatamente (ex: alto risco)

                        if (data_get($payment, 'status') === 'rejected') {

                    Log::warning('Pagamento recusado pela operadora (Mercado Pago)', [

                        'payment_id' => data_get($payment, 'id'),

                        'status' => data_get($payment, 'status'),

                        'status_detail' => data_get($payment, 'status_detail'),

                        'tenant_id' => $tenant->id,

                    ]);

        

                    return [

                        'error' => 'payment_rejected',

                        'message' => 'A operadora recusou o pagamento. Verifique os dados ou tente com um valor maior.',

                    ];

                }

        

                        Payment::updateOrCreate(

        

                            [

        

                                'payment_id' => $payment['id'], // Atributo para encontrar o pagamento

        

                            ],

        

                            [

        

                                'tenant_id' => $tenant->id,

        

                                'amount' => $plan->value,

        

                                'status' => $payment['status'], // Atualiza com o status mais recente

        

                                'idempotency_key' => $idempotencyKey,

        

                                'raw_response' => $payment,

        

                            ]

        

                        );

        

                return [

                    'payment_id' => $payment['id'],

                    'qr_code' => data_get($payment, 'point_of_interaction.transaction_data.qr_code'),

                    'qr_code_base64' => data_get(

                        $payment,

                        'point_of_interaction.transaction_data.qr_code_base64'

                    ),

                ];
    }

    /* ===============================
       WEBHOOK MERCADO PAGO
    ================================ */
    public function handleWebhook(Request $request)
    {
        // 🔐 Aceita apenas eventos de pagamento
        if ($request->input('type') !== 'payment') {
            return response()->json(['status' => 'ignored'], 200);
        }

        $paymentId = $request->input('data.id') ?? $request->input('id');

        if (!$paymentId) {
            Log::warning('Webhook sem payment_id');
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

        $localPayment = Payment::where('payment_id', $paymentId)->first();

        if ($localPayment) {
            $localPayment->update([
                'status' => $payment['status'],
                'raw_response' => $payment,
            ]);
        }

        if ($payment['status'] !== 'approved') {
            return response()->json(['status' => 'not_approved'], 200);
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
