<?php

use App\Http\Controllers\App\PaymentController;
use App\Http\Controllers\App\SubscriptionController;
use App\Http\Controllers\OsController;
use App\Http\Controllers\Site\HomeController;
use App\Http\Controllers\TenantFeedbackController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', [HomeController::class, 'index'])->name('home');
Route::get('/os/{token}', [OsController::class, 'index'])->name('os.token');
Route::post('/os/{token}/budget-status', [OsController::class, 'updateBudgetStatus'])
    ->name('orders.budget.status');
Route::post('/os/{token}/acknowledge-notification', [OsController::class, 'acknowledgeNotification'])
    ->name('orders.notification.acknowledge');
Route::post('/os/{token}/acknowledge-pickup', [OsController::class, 'acknowledgePickup'])
    ->name('orders.pickup.acknowledge');
Route::get('/os/{token}/receipt/{type}', [OsController::class, 'receipt'])
    ->name('os.receipt');
Route::get('/os/{token}/payment-proof', [OsController::class, 'paymentProof'])
    ->name('os.payment-proof');
Route::get('/os/{token}/fiscal-proof', [OsController::class, 'fiscalProof'])
    ->name('os.fiscal-proof');
Route::post('/os/{token}/feedback', [OsController::class, 'submitFeedback'])
    ->name('os.feedback.submit');
Route::get('/experience/{token}', [TenantFeedbackController::class, 'show'])->name('tenant.feedback.show');
Route::post('/experience/{token}', [TenantFeedbackController::class, 'submit'])->name('tenant.feedback.submit');

Route::get('/privacidade', function () {
    return Inertia::render('site/privacy/index');
});

Route::get('/termos', function () {
    return Inertia::render('site/terms/index');
});
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

require __DIR__.'/auth.php';
