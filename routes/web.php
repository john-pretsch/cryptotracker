<?php

use App\Http\Controllers\ApiController;
use App\Http\Controllers\CoinController;
use App\Http\Controllers\CommodityController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\StockController;
use Illuminate\Support\Facades\Route;

Route::get('/', [HomeController::class, 'index'])->name('home');
Route::get('/coins', [CoinController::class, 'index'])->name('coins.index');
Route::get('/coins/{id}', [CoinController::class, 'show'])->name('coins.show');
Route::get('/commodities', [CommodityController::class, 'index'])->name('commodities.index');
Route::redirect('/stocks', '/stocks/tsx')->name('stocks');
Route::get('/stocks/{exchange}', [StockController::class, 'index'])
    ->where('exchange', 'tsx|nyse|nasdaq')
    ->name('stocks.index');

Route::prefix('_api')->group(function () {
    Route::get('/search', [ApiController::class, 'search']);
    Route::get('/chart/{id}', [ApiController::class, 'chart']);
    Route::get('/global', [ApiController::class, 'global']);
    Route::get('/stocks/search', [ApiController::class, 'stockSearch']);
});

Route::get('/dashboard', function () {
    return inertia('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
