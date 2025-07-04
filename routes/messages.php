<?php
use App\Http\Controllers\MessageController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->group(function () {
    Route::resource('messages', MessageController::class);
    Route::patch('messages/{message}/read', [MessageController::class, 'read'])->name('messages.read');
});
