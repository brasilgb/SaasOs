<?php

use App\Http\Controllers\BrandController;
use App\Http\Controllers\BudgetController;
use App\Http\Controllers\ChecklistController;
use App\Http\Controllers\EQModelController;
use App\Http\Controllers\EquipmentController;
use App\Http\Controllers\ServiceController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->group(function () {
    Route::resource('register-brands', BrandController::class)->parameters(['register-brands' => 'brand']);
    Route::resource('register-equipments', EquipmentController::class)->parameters(['register-equipments' => 'equipment']);
    Route::resource('register-models', EQModelController::class)->parameters(['register-models' => 'eQModel']);
    Route::resource('register-services', ServiceController::class)->parameters(['register-services' => 'service']);
    Route::resource('register-checklists', ChecklistController::class)->parameters(['register-checklists' => 'checklist']);
    Route::resource('register-budgets', BudgetController::class)->parameters(['register-budgets' => 'budget']);
});
