<?php

namespace App\Services;

use MercadoPago\Client\Common\RequestOptions;
use MercadoPago\Client\Payment\PaymentClient;
use MercadoPago\MercadoPagoConfig;

class MercadoPagoService
{
    public function __construct()
    {
        MercadoPagoConfig::setAccessToken((string) config('services.mercadopago.token'));
    }

    public function createPixPayment(array $paymentRequest, string $idempotencyKey): mixed
    {
        $options = new RequestOptions;
        $options->setCustomHeaders(['x-idempotency-key' => $idempotencyKey]);

        return (new PaymentClient)->create($paymentRequest, $options);
    }

    public function getPayment(string|int $paymentId): mixed
    {
        return (new PaymentClient)->get($paymentId);
    }
}
