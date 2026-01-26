<?php

use App\Http\Controllers\App\PaymentController;
use App\Http\Controllers\Site\HomeController;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;

Route::get('/', [HomeController::class, 'index'])->name('home');

Route::middleware(['auth'])
    ->prefix('subscription')
    ->group(function () {

        Route::get('/expired', [PaymentController::class, 'expired'])
            ->name('subscription.expired');
        
        Route::get('/pay-in-advance', [PaymentController::class, 'payInAdvance'])
        ->name('subscription.pay-in-advance');

        Route::post('/select-plan', [PaymentController::class, 'selectPlan'])
            ->name('payment.select-plan');

        Route::get('/payment-status/{paymentId}', [PaymentController::class, 'paymentStatus'])
            ->name('payment.status');
    });

require __DIR__ . '/auth.php';
