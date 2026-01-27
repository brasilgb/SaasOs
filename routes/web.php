<?php

use App\Http\Controllers\App\PaymentController;
use App\Http\Controllers\Site\HomeController;
use Illuminate\Support\Facades\Route;

Route::get('/', [HomeController::class, 'index'])->name('home');

/*
|--------------------------------------------------------------------------
| Assinatura / Pagamentos
|--------------------------------------------------------------------------
*/
Route::middleware(['auth'])
    ->prefix('subscription')
    ->group(function () {

        Route::get('/expired', [PaymentController::class, 'expired'])
            ->name('subscription.expired');

        Route::get('/pay-in-advance', [PaymentController::class, 'payIn-advance']);

        Route::post('/select-plan', [PaymentController::class, 'selectPlan'])
            ->name('payment.select-plan');
    });

/*
|--------------------------------------------------------------------------
| Polling PIX (não bloqueia por assinatura)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth'])
    ->get('/payment-status/{paymentId}', [PaymentController::class, 'paymentStatus'])
    ->name('payment.status');

/*
|--------------------------------------------------------------------------
| Webhook Mercado Pago
|--------------------------------------------------------------------------
*/
Route::post('/webhook/mercadopago', [PaymentController::class, 'handleWebhook'])
    ->name('webhook.mercadopago');

require __DIR__ . '/auth.php';
