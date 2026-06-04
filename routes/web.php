<?php

use App\Http\Controllers\ApiController;
use App\Http\Controllers\CoinController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\StockController;
use Illuminate\Support\Facades\Route;

Route::get('/', [HomeController::class, 'index'])->name('home');
Route::get('/coins', [CoinController::class, 'index'])->name('coins.index');
Route::get('/coins/{id}', [CoinController::class, 'show'])->name('coins.show');
Route::get('/stocks', [StockController::class, 'index'])->name('stocks.index');

Route::prefix('_api')->group(function () {
    Route::get('/search', [ApiController::class, 'search']);
    Route::get('/chart/{id}', [ApiController::class, 'chart']);
    Route::get('/global', [ApiController::class, 'global']);
    Route::get('/stocks/search', [ApiController::class, 'stockSearch']);
});
