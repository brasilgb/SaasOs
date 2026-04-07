<?php

use App\Http\Controllers\App\BudgetController;
use App\Http\Controllers\App\ChecklistController;
use App\Http\Controllers\App\CashSessionController;
use App\Http\Controllers\App\CompanyController;
use App\Http\Controllers\App\CustomerController;
use App\Http\Controllers\App\DashboardController;
use App\Http\Controllers\App\EquipmentController;
use App\Http\Controllers\App\ImageController;
use App\Http\Controllers\App\LabelPrintingController;
use App\Http\Controllers\App\MessageController;
use App\Http\Controllers\App\OrderController;
use App\Http\Controllers\App\OtherController;
use App\Http\Controllers\App\PartController;
use App\Http\Controllers\App\ReceiptController;
use App\Http\Controllers\App\ReportController;
use App\Http\Controllers\App\SaleController;
use App\Http\Controllers\App\ScheduleController;
use App\Http\Controllers\App\ServiceController;
use App\Http\Controllers\App\UserController;
use App\Http\Controllers\App\WhatsappMessageController;
use Illuminate\Support\Facades\Route;

Route::get('/', [DashboardController::class, 'index'])->name('dashboard');
Route::get('/chartEquipments/{timerange}', [DashboardController::class, 'chartEquipments'])->name('chartEquipments');
Route::get('/fluxsOrders/{timerange}', [DashboardController::class, 'fluxsOrders'])->name('fluxsOrders');
Route::get('/dashboardData/{timerange}', [DashboardController::class, 'dashboardData'])->name('dashboardData');
Route::get('/metricsSystem/{timerange}', [DashboardController::class, 'metricsSystem'])->name('metricsSystem');
Route::get('/kpisFinancialOrder/{timerange}', [DashboardController::class, 'kpisFinancialOrder'])->name('kpisFinancialOrder');
Route::get('/financialRevenueChart/{timerange}', [DashboardController::class, 'financialRevenueChart'])->name('financialRevenueChart');
Route::get('/kpisFinancialSales/{timerange}', [DashboardController::class, 'kpisFinancialSales'])->name('kpisFinancialSales');
Route::get('/financialSalesRevenueChart/{timerange}', [DashboardController::class, 'financialSalesRevenueChart'])->name('financialSalesRevenueChart');

Route::resource('customers', CustomerController::class);
Route::post('customers/import-customer', [CustomerController::class, 'ImportCustomer'])->name('import.customer');
Route::resource('messages', MessageController::class);
Route::patch('messages/{message}/read', [MessageController::class, 'read'])->name('messages.read');
Route::patch('orders/{order}/feedback', [OrderController::class, 'markFeedback'])->name('orders.feedback');
Route::resource('orders', OrderController::class);
Route::post('orders/{order}/payments', [OrderController::class, 'storePayment'])->name('orders.payments.store');
Route::post('orders/{order}/payments/reminder', [OrderController::class, 'sendPaymentReminder'])->name('orders.payments.reminder');
Route::delete('orders/{order}/payments/{payment}', [OrderController::class, 'destroyPayment'])->name('orders.payments.destroy');
Route::get('orders/{order}/payments-data', [OrderController::class, 'paymentsData'])->name('orders.payments.data');
Route::post('orders/{order}/fiscal', [OrderController::class, 'registerFiscal'])->name('orders.fiscal.register');
Route::resource('schedules', ScheduleController::class);
Route::resource('services', ServiceController::class);
Route::resource('users', UserController::class);
Route::resource('budgets', BudgetController::class);
Route::resource('whatsapp-messages', WhatsappMessageController::class);
Route::resource('register-equipments', EquipmentController::class)->parameters(['register-equipments' => 'equipment']);
Route::resource('register-services', ServiceController::class)->parameters(['register-services' => 'service']);
Route::resource('register-checklists', ChecklistController::class)->parameters(['register-checklists' => 'checklist']);
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
Route::get('label-printing-print', [LabelPrintingController::class, 'print'])->name('label-printing.print');
Route::resource('/parts', PartController::class);
Route::post('/orders/remove-part', [OrderController::class, 'removePart'])->name('orders.removePart');
Route::resource('/sales', SaleController::class);
Route::post('/sales/{sale}/cancel', [SaleController::class, 'cancel'])->name('sales.cancel');
Route::post('/sales/{sale}/fiscal', [SaleController::class, 'registerFiscal'])->name('sales.fiscal.register');
Route::get('/cashier', [CashSessionController::class, 'index'])->name('cashier.index');
Route::post('/cashier/open', [CashSessionController::class, 'open'])->name('cashier.open');
Route::post('/cashier/{cashSession}/close', [CashSessionController::class, 'close'])->name('cashier.close');
Route::resource('/reports', ReportController::class);
