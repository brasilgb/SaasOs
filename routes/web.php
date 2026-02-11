<?php

use App\Http\Controllers\App\PaymentController;
use App\Http\Controllers\App\SubscriptionController;
use App\Http\Controllers\Site\HomeController;
use Illuminate\Support\Facades\Route;

Route::get('/', [HomeController::class, 'index'])->name('home');

/*
|--------------------------------------------------------------------------
| Assinatura e Pagamentos
|--------------------------------------------------------------------------
*/
Route::middleware(['auth'])->group(function () {
    // Tela de bloqueio
    Route::get('/subscription/blocked', [SubscriptionController::class, 'blocked'])
        ->name('subscription.blocked');
    
    // Rota para checagem via Polling (AJAX)
    Route::get('/api/subscription/check', [SubscriptionController::class, 'checkStatus'])
        ->name('subscription.check_status');

    // Rota que gera o PIX (já criada anteriormente, mas reforçando)
    Route::post('/subscription/pay', [PaymentController::class, 'generatePix'])
        ->name('subscription.pay');

        Route::post('/subscription/generate-pix', [PaymentController::class, 'generatePix'])
    ->name('subscription.generate_pix');
});

require __DIR__ . '/auth.php';
