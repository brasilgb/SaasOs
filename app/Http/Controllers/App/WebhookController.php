<?php

namespace App\Http\Controllers\App;

use App\Http\Controllers\Controller;
use App\Models\Admin\Plan;
use App\Models\App\Payment;
use App\Models\Tenant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use MercadoPago\Client\Payment\PaymentClient;
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

        if (! $paymentId) {
            return response()->json(['error' => 'ID missing'], 400);
        }

        try {
            MercadoPagoConfig::setAccessToken(config('services.mercadopago.token'));
            $client = new PaymentClient;

            $payment = $client->get($paymentId);
            $this->syncPaymentRecord($payment);

            if ($payment->status === 'approved') {
                return $this->processApproval($payment);
            }

            return response()->json(['status' => 'processed_not_approved']);

        } catch (\Exception $e) {
            Log::error('Erro ao processar Webhook MP: '.$e->getMessage());

            return response()->json(['error' => 'Internal Server Error'], 500);
        }
    }

    private function processApproval($payment)
    {
        $metadata = $this->parseExternalReference($payment->external_reference ?? null);
        if (! $metadata || empty($metadata['tenant_id']) || empty($metadata['plan_id'])) {
            Log::error('Pagamento aprovado sem metadados válidos.', ['payment_id' => $payment->id]);

            return response()->json(['error' => 'Invalid metadata'], 422);
        }

        $plan = Plan::find($metadata['plan_id']);
        if (! $plan) {
            return response()->json(['error' => 'Plan not found'], 404);
        }

        $months = $plan->billingMonths();
        if ($months <= 0) {
            Log::error('Plano sem período de renovação válido.', [
                'payment_id' => $payment->id,
                'plan_id' => $plan->id,
                'plan_slug' => $plan->slug,
            ]);

            return response()->json(['error' => 'Plan period not configured'], 422);
        }

        $updated = DB::transaction(function () use ($metadata, $payment, $plan, $months) {
            $tenant = Tenant::query()->lockForUpdate()->find($metadata['tenant_id']);
            if (! $tenant) {
                return false;
            }

            if ((string) $tenant->last_payment_id === (string) $payment->id) {
                return true;
            }

            $startBase = ($tenant->expires_at && $tenant->expires_at->isFuture())
                ? $tenant->expires_at->copy()
                : now();

            $tenant->update([
                'plan_id' => $plan->id,
                'subscription_status' => 'active',
                'expires_at' => $startBase->addMonths($months),
                'last_payment_id' => (string) $payment->id,
                'status' => 1,
            ]);

            Payment::updateOrCreate(
                ['payment_id' => (string) $payment->id],
                $this->buildPaymentPayload($payment, $tenant->id)
            );

            Log::info("Tenant {$tenant->name} renovado via PIX. Plano: {$plan->name}");

            return true;
        });

        if (! $updated) {
            return response()->json(['error' => 'Tenant not found'], 404);
        }

        return response()->json(['status' => 'success']);
    }

    private function syncPaymentRecord($payment): void
    {
        $metadata = $this->parseExternalReference($payment->external_reference ?? null);
        $paymentId = (string) $payment->id;

        $existing = Payment::where('payment_id', $paymentId)->first();
        $tenantId = $metadata['tenant_id'] ?? ($existing?->tenant_id);
        if (! $tenantId) {
            Log::warning('Webhook sem tenant_id válido para sincronizar pagamento.', [
                'payment_id' => $paymentId,
            ]);

            return;
        }

        Payment::updateOrCreate(
            ['payment_id' => $paymentId],
            $this->buildPaymentPayload($payment, (int) $tenantId)
        );
    }

    private function buildPaymentPayload($payment, int $tenantId): array
    {
        $paymentId = (string) $payment->id;
        $existing = Payment::query()->where('payment_id', $paymentId)->first();
        $idempotencyKey = $existing?->idempotency_key;

        if (! $idempotencyKey || trim($idempotencyKey) === '') {
            $idempotencyKey = 'webhook-'.$paymentId;
        }

        return [
            'tenant_id' => $tenantId,
            'gateway' => 'mercadopago',
            'amount' => (float) ($payment->transaction_amount ?? 0),
            'status' => (string) ($payment->status ?? 'unknown'),
            'idempotency_key' => $idempotencyKey,
            'expires_at' => $payment->date_of_expiration ?? null,
            'raw_response' => json_decode(json_encode($payment), true),
        ];
    }

    private function parseExternalReference(mixed $externalReference): ?array
    {
        if (! is_string($externalReference) || $externalReference === '') {
            return null;
        }

        $metadata = json_decode($externalReference, true);
        if (! is_array($metadata)) {
            return null;
        }

        return $metadata;
    }
}
