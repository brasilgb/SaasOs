<?php

use App\Http\Controllers\App\PaymentController;
use App\Http\Controllers\Site\HomeController;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;

Route::get('/', [HomeController::class, 'index'])->name('home');
use MercadoPago\SDK;
use MercadoPago\Payment;

Route::get('/subscription/expired', function () {
    $tenant = Auth::user()->tenant;

    // Lógica para buscar ou gerar um novo Pix no Mercado Pago
    // Aqui estou assumindo que você já tem uma lógica de geração
    $pixData = app(PaymentController::class)->generatePixData($tenant);

    return inertia('Auth/ExpiredSubscription', [
        'pix_code_base64' => $pixData['qr_code_base64'],
        'pix_copy_paste' => $pixData['qr_code'],
    ]);
})->name('subscription.expired');
require __DIR__ . '/auth.php';
