<?php

use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use Illuminate\Support\Facades\Route;

    Route::get('/dashboard', [AdminDashboardController::class, 'index'])->name('dashboard');
