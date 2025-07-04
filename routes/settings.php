<?php

use App\Http\Controllers\CompanyController;
use App\Http\Controllers\ImageController;
use App\Http\Controllers\LabelPrintingController;
use App\Http\Controllers\OtherController;
use App\Http\Controllers\ReceiptController;
use App\Http\Controllers\Settings\PasswordController;
use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\WhatsappMessageController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware('auth')->group(function () {
    Route::get('images', [ImageController::class, 'index'])->name('images.index');
    Route::post('images', [ImageController::class, 'store'])->name('images.store');
    Route::delete('images/{image}', [ImageController::class, 'destroy'])->name('images.destroy');
    
    Route::get('other-settings', [OtherController::class, 'index'])->name('other-settings.index');
    Route::put('other-settings/{other}', [OtherController::class, 'update'])->name('other-settings.update');
    Route::redirect('settings', 'settings/profile');

    Route::resource('company', CompanyController::class);
    Route::resource('whatsapp-message', WhatsappMessageController::class)->parameters(['whatsapp-message' => 'whatsappmessage']);
    Route::resource('receipts', ReceiptController::class);
    Route::get('receipts/{or}/{tp}', [ReceiptController::class, 'printing'])->name('receipts.printing');
    
    Route::resource('label-printing', LabelPrintingController::class);

    Route::get('settings/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('settings/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('settings/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('settings/password', [PasswordController::class, 'edit'])->name('password.edit');
    Route::put('settings/password', [PasswordController::class, 'update'])->name('password.update');
 
    Route::get('settings/appearance', function () {
        return Inertia::render('settings/appearance');
    })->name('appearance');
});
