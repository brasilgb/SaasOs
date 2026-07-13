<?php

use App\Http\Controllers\Admin\BranchController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\FeatureController;
use App\Http\Controllers\Admin\FiscalDocumentController;
use App\Http\Controllers\Admin\PeriodController;
use App\Http\Controllers\Admin\PlanController;
use App\Http\Controllers\Admin\ProspectController;
use App\Http\Controllers\Admin\SettingController;
use App\Http\Controllers\Admin\TenantController;
use App\Http\Controllers\Admin\TenantFeedbackController;
use App\Http\Controllers\Admin\TenantImprovementRequestController;
use App\Http\Controllers\Admin\UserController;
use Illuminate\Support\Facades\Route;

Route::get('/', [DashboardController::class, 'index'])->name('dashboard');
Route::get('/tenants/{tenant}/subscription-email-preview/{scenario}', [TenantController::class, 'previewSubscriptionEmail'])
    ->name('tenants.subscription-email-preview');
Route::get('/tenants/{tenant}/subscription-invoice-email-preview', [TenantController::class, 'previewSubscriptionInvoiceEmail'])
    ->name('tenants.subscription-invoice-email-preview');
Route::post('/tenants/{tenant}/subscription-email-send/{scenario}', [TenantController::class, 'sendSubscriptionEmail'])
    ->name('tenants.subscription-email-send');
Route::get('/tenant-feedbacks', [TenantFeedbackController::class, 'index'])->name('tenant-feedbacks.index');
Route::patch('/tenant-feedbacks/{tenantFeedback}', [TenantFeedbackController::class, 'update'])->name('tenant-feedbacks.update');
Route::get('/tenant-improvement-requests', [TenantImprovementRequestController::class, 'index'])->name('tenant-improvement-requests.index');
Route::get('/tenant-improvement-requests/{tenantImprovementRequest}/preview/admin-email', [TenantImprovementRequestController::class, 'previewAdminEmail'])
    ->name('tenant-improvement-requests.preview-admin-email');
Route::get('/tenant-improvement-requests/{tenantImprovementRequest}/preview/customer-email', [TenantImprovementRequestController::class, 'previewCustomerEmail'])
    ->name('tenant-improvement-requests.preview-customer-email');
Route::patch('/tenant-improvement-requests/{tenantImprovementRequest}', [TenantImprovementRequestController::class, 'update'])->name('tenant-improvement-requests.update');
Route::get('/fiscal-documents', [FiscalDocumentController::class, 'index'])->name('fiscal-documents.index');
Route::resource('/tenants', TenantController::class);
Route::resource('/branches', BranchController::class);
Route::resource('/plans', PlanController::class);
Route::patch('/prospects/{prospect}/contact', [ProspectController::class, 'contact'])->name('prospects.contact');
Route::resource('/prospects', ProspectController::class)->except(['create', 'show', 'edit']);
Route::resource('/features', FeatureController::class);
Route::resource('/periods', PeriodController::class);
Route::resource('/settings', SettingController::class);
Route::resource('/users', UserController::class);
