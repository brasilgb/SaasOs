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

        if (!$tenant->plan_id) {
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
            'plan_id' => $data['plan_id'],
            'subscription_status' => 'pending',
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
            'status' => $payment?->status,
        ]);
    }

    /* ===============================
       GERAÇÃO DE PIX (IDEMPOTENTE)
    ================================ */
    private function generatePixData(Tenant $tenant): array
    {
        $plan = Plan::find($tenant->plan_id);

        if (!$plan || $plan->value <= 0) {
            return ['requires_plan' => true];
        }

        $idempotencyKey = 'pix_' . $tenant->id . '_' . $plan->id . '_subscription';

        // Reutiliza Pix pendente e válido
        $pendingPayment = Payment::where('idempotency_key', $idempotencyKey)
            ->where('status', 'pending')
            ->where('expires_at', '>', now())
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
            return ['error' => 'payment_unavailable'];
        }

        $document = preg_replace('/\D/', '', $tenant->cnpj);
        $docType = strlen($document) === 14 ? 'CNPJ' : 'CPF';

        if (!in_array(strlen($document), [11, 14])) {
            Log::error('Documento inválido', [
                'tenant_id' => $tenant->id,
                'document' => $tenant->cnpj,
            ]);

            return ['error' => 'invalid_document_number'];
        }

        $expiration = now()->addMinutes(30);

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
                    'number' => $document,
                ],
            ],
            'metadata' => [
                'tenant_id' => $tenant->id,
                'plan_id' => $plan->id,
            ],
            'notification_url' => config('services.mercadopago.webhook_url'),
            'date_of_expiration' => $expiration->format('Y-m-d\TH:i:s.vP'),
        ];

        $response = Http::withToken($token)
            ->withHeaders([
                'X-Idempotency-Key' => $idempotencyKey,
            ])
            ->timeout(15)
            ->post('https://api.mercadopago.com/v1/payments', $payload);

        if (!$response->ok()) {
            Log::error('Erro ao gerar Pix Mercado Pago', [
                'status' => $response->status(),
                'response' => $response->json(),
            ]);

            return ['error' => 'pix_generation_failed'];
        }

        $payment = $response->json();

        if (!data_get($payment, 'point_of_interaction.transaction_data.qr_code_base64')) {
            Log::error('Pix sem QR Code', ['payment' => $payment]);
            return ['error' => 'pix_generation_failed'];
        }

        Payment::updateOrCreate(
            ['idempotency_key' => $idempotencyKey],
            [
                'payment_id' => (string) $payment['id'],
                'tenant_id' => $tenant->id,
                'amount' => $plan->value,
                'status' => $payment['status'],
                'expires_at' => Carbon::parse($payment['date_of_expiration']),
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
        if ($request->input('type') !== 'payment') {
            return response()->json(['status' => 'ignored'], 200);
        }

        $paymentId = $request->input('data.id') ?? $request->input('id');

        if (!$paymentId) {
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

        $localPayment = Payment::where('payment_id', (string) $paymentId)->first();

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
        $tenant = Tenant::find($tenantId);

        if (!$tenant || $tenant->last_payment_id === $payment['id']) {
            return response()->json(['status' => 'already_processed'], 200);
        }

        $plan = Plan::find($tenant->plan_id);

        if (
            !$plan ||
            (float) $payment['transaction_amount'] !== (float) $plan->value
        ) {
            Log::warning('Valor divergente', [
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
            'subscription_status' => 'active',
            'status' => 1,
            'last_payment_id' => $payment['id'],
            'expires_at' => $baseDate->addDays(30),
        ]);

        Log::info('Assinatura renovada', [
            'tenant_id' => $tenant->id,
            'payment_id' => $paymentId,
        ]);

        return response()->json(['status' => 'success'], 200);
    }
}
