<?php

use App\Http\Controllers\DashboardController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/', [DashboardController::class, 'index'])->name('dashboard');
});

require __DIR__.'/registration.php';
require __DIR__.'/customers.php';
require __DIR__.'/messages.php';
require __DIR__.'/orders.php';
require __DIR__.'/schedules.php';
require __DIR__.'/settings.php';
require __DIR__.'/users.php';
require __DIR__.'/auth.php';
