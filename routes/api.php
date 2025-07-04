<?php

use App\Http\Controllers\App\BrandController;
use App\Http\Controllers\App\BudgetController;
use App\Http\Controllers\App\CompanyController;
use App\Http\Controllers\App\CustomerController;
use App\Http\Controllers\App\EQModelController;
use App\Http\Controllers\App\ImageController;
use App\Http\Controllers\App\OrderController;
use App\Http\Controllers\App\ServiceController;
use App\Http\Controllers\App\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::get('/ordercli/{customer}', [OrderController::class, 'getOrderCli'])->name('ordercli');
Route::get('/allorder', [OrderController::class, 'allOrder'])->name('allorder');
Route::get('/order/{order}', [OrderController::class, 'getOrder'])->name('order');

Route::get('/clientes', [CustomerController::class, 'getClientes']);

Route::post('/orcamentos', [BudgetController::class, 'getOrcamentos']);

Route::post('/servicos', [ServiceController::class, 'getServicos']);

Route::get('/marcas', [BrandController::class, 'getMarcas']);

Route::post('/modelos', [EQModelController::class, 'getModelos']);

Route::get('/empresa', [CompanyController::class, 'getEmpresaInfo']);

Route::delete('/deleteimage/{aimage}', [ImageController::class, 'deleteImageOrder'])->name('deleteimage');
Route::get('/images/{order}', [ImageController::class, 'getImages'])->name('images');
Route::post('/upload', [ImageController::class, 'upload'])->name('upload');

Route::post('/loginuser', [UserController::class, 'loginuser'])->name('loginuser');
Route::get('/logoutuser', [UserController::class, 'logoutuser'])->name('logoutuser');

