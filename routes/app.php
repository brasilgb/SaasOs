<?php

use App\Http\Controllers\App\BrandController;
use App\Http\Controllers\App\BudgetController;
use App\Http\Controllers\App\ChecklistController;
use App\Http\Controllers\App\CompanyController;
use App\Http\Controllers\App\OtherController;
use App\Http\Controllers\App\ReceiptController;
use App\Http\Controllers\App\LabelPrintingController;
use App\Http\Controllers\App\EquipmentController;
use App\Http\Controllers\App\EQModelController;
use App\Http\Controllers\App\ImageController;
use App\Http\Controllers\App\CustomerController;
use App\Http\Controllers\App\DashboardController;
use App\Http\Controllers\App\MessageController;
use App\Http\Controllers\App\OrderController;
use App\Http\Controllers\App\PartController;
use App\Http\Controllers\App\ScheduleController;
use App\Http\Controllers\App\ServiceController;
use App\Http\Controllers\App\UserController;
use App\Http\Controllers\App\WhatsappMessageController;
use Illuminate\Support\Facades\Route;

Route::get('/', [DashboardController::class, 'index'])->name('dashboard');
Route::resource('customers', CustomerController::class);
Route::resource('messages', MessageController::class);
Route::patch('messages/{message}/read', [MessageController::class, 'read'])->name('messages.read');
Route::resource('orders', OrderController::class);
Route::resource('schedules', ScheduleController::class);
Route::resource('services', ServiceController::class);
Route::resource('users', UserController::class);
Route::resource('whatsapp-messages', WhatsappMessageController::class);
Route::resource('register-brands', BrandController::class)->parameters(['register-brands' => 'brand']);
Route::resource('register-equipments', EquipmentController::class)->parameters(['register-equipments' => 'equipment']);
Route::resource('register-models', EQModelController::class)->parameters(['register-models' => 'eQModel']);
Route::resource('register-services', ServiceController::class)->parameters(['register-services' => 'service']);
Route::resource('register-checklists', ChecklistController::class)->parameters(['register-checklists' => 'checklist']);
Route::resource('register-budgets', BudgetController::class)->parameters(['register-budgets' => 'budget']);
Route::get('images', [ImageController::class, 'index'])->name('images.index');
Route::post('images', [ImageController::class, 'store'])->name('images.store');
Route::delete('images/{image}', [ImageController::class, 'destroy'])->name('images.destroy');

Route::get('other-settings', [OtherController::class, 'index'])->name('other-settings.index');
Route::put('other-settings/{other}', [OtherController::class, 'update'])->name('other-settings.update');

Route::resource('company', CompanyController::class);
Route::resource('whatsapp-message', WhatsappMessageController::class)->parameters(['whatsapp-message' => 'whatsappmessage']);
Route::resource('receipts', ReceiptController::class);
Route::get('receipts/{or}/{tp}', [ReceiptController::class, 'printing'])->name('receipts.printing');

Route::resource('label-printing', LabelPrintingController::class);
Route::resource('/parts', PartController::class);
Route::post('/orders/remove-part', [OrderController::class, 'removePart'])->name('orders.removePart');