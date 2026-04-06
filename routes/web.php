<?php

use App\Http\Controllers\App\PaymentController;
use App\Http\Controllers\App\SubscriptionController;
use App\Http\Controllers\OsController;
use App\Http\Controllers\Site\HomeController;
use App\Mail\UserRegisteredMail;
use App\Models\User;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/preview/email/order-status', function () {
    $order = User::latest()->firstOrFail();
    return new UserRegisteredMail($order);
});

Route::get('/', [HomeController::class, 'index'])->name('home');
Route::get('/os/{token}', [OsController::class, 'index'])->name('os.token');
Route::post('/orders/{order}/budget-status', [OsController::class, 'updateBudgetStatus'])
    ->name('orders.budget.status');

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
