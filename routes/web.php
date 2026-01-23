<?php

use App\Http\Controllers\App\PaymentController;
use App\Http\Controllers\Site\HomeController;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;

Route::get('/', [HomeController::class, 'index'])->name('home');

Route::middleware(['auth'])
    ->get('/subscription/expired', [PaymentController::class, 'expired'])
    ->name('subscription.expired');
require __DIR__ . '/auth.php';
