<?php

namespace App\Http\Controllers\App;

use App\Http\Controllers\Controller;
use App\Models\Admin\Plan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use MercadoPago\Client\Payment\PaymentClient;
use MercadoPago\MercadoPagoConfig;

class PaymentController extends Controller
{
    public function __construct()
    {
        MercadoPagoConfig::setAccessToken(env('MP_ACCESS_TOKEN'));
    }

    public function generatePix(Request $request)
    {
        try {
            $tenant = auth()->user()->tenant;
            $plan = Plan::findOrFail($request->plan_id);

            $client = new PaymentClient();
            $webhookToken = config('services.mercadopago.webhook_token') ?? env('MP_WEBHOOK_TOKEN', 'default_token');
            $idempotencyKey = Str::uuid()->toString();
            // Criação do payload PIX
            $payment = $client->create([
                "transaction_amount" => (float) $plan->value,
                "description" => "Assinatura " . $plan->name . " - " . $tenant->name,
                "payment_method_id" => "pix",
                "payer" => [
                    "email" => $tenant->email,
                    "first_name" => $tenant->name,
                    "identification" => [
                        "type" => "CNPJ", // Ou CPF dependendo da sua lógica
                        "number" => preg_replace('/[^0-9]/', '', $tenant->cnpj)
                    ]
                ],
                // IMPORTANTE: Referência para identificar no Webhook
                "external_reference" => json_encode([
                    'tenant_id' => $tenant->id,
                    'plan_id' => $plan->id
                ]),
                "notification_url" => route('webhook.mercadopago', ['token' => $webhookToken]),
                "headers" => [
                    "X-Idempotency-Key" => $idempotencyKey,
                ],
            ]);

            return response()->json([
                'qr_code' => $payment->point_of_interaction->transaction_data->qr_code_base64,
                'qr_code_copy_paste' => $payment->point_of_interaction->transaction_data->qr_code,
                'payment_id' => $payment->id
            ]);
        } catch (\MercadoPago\Exceptions\MPApiException $e) {
            Log::error("Detalhes da API Mercado Pago: " . json_encode($e->getApiResponse()->getContent()));
            return response()->json(['error' => 'Falha na comunicação com o provedor'], 500);
        }
    }
}
