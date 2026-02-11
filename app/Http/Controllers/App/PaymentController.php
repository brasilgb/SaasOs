<?php

namespace App\Http\Controllers\App;

use App\Http\Controllers\Controller;
use App\Models\Admin\Plan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use MercadoPago\Client\Payment\PaymentClient;
use MercadoPago\Client\Common\RequestOptions; // Adicione esta linha
use MercadoPago\MercadoPagoConfig;
use Illuminate\Support\Facades\Http;
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

            $options = new RequestOptions();
            $options->setCustomHeaders(["x-idempotency-key" => Str::uuid()->toString()]);

            // 2. Montar o payload do pagamento (sem a chave "headers")
            $paymentRequest = [
                "transaction_amount" => (float) $plan->value,
                "description" => "Assinatura " . $plan->name . " - " . $tenant->name,
                "payment_method_id" => "pix",
                "payer" => [
                    "email" => $tenant->email,
                    "first_name" => explode(' ', trim($tenant->name))[0], // Apenas o primeiro nome evita erros de validação
                    "identification" => [
                        "type" => strlen(preg_replace('/\D/', '', $tenant->cnpj)) > 11 ? "CNPJ" : "CPF",
                        "number" => preg_replace('/\D/', '', $tenant->cnpj)
                    ]
                ],
                "external_reference" => json_encode([
                    'tenant_id' => $tenant->id,
                    'plan_id' => $plan->id
                ]),
                // Garantir HTTPS na URL de notificação para evitar rejeição em produção
                "notification_url" => str_replace('http://', 'https://', route('webhook.mercadopago', ['token' => $webhookToken])),
            ];

            // 3. O segredo: Passar o $requestOptions como SEGUNDO parâmetro
            $payment = $client->create($paymentRequest, $options);

            return response()->json([
                'qr_code' => $payment->point_of_interaction->transaction_data->qr_code_base64,
                'qr_code_copy_paste' => $payment->point_of_interaction->transaction_data->qr_code,
                'payment_id' => $payment->id
            ]);
        } catch (\MercadoPago\Exceptions\MPApiException $e) {
            $content = $e->getApiResponse()->getContent();
            Log::error("Detalhes da API Mercado Pago: " . json_encode($content));

            return response()->json([
                'error' => 'Falha na comunicação com o provedor',
                'details' => $content['message'] ?? 'Erro desconhecido'
            ], 500);
        } catch (\Exception $e) {
            Log::error("Erro Geral no Pagamento: " . $e->getMessage());
            return response()->json(['error' => 'Erro interno ao processar pagamento'], 500);
        }
    }
}
