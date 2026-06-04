<?php

namespace App\Http\Controllers;

use App\Services\YahooFinanceService;
use Inertia\Inertia;
use Inertia\Response;

class StockController extends Controller
{
    public function __construct(private YahooFinanceService $yahoo) {}

    public function index(): Response
    {
        $stocks = $this->yahoo->getQuotes();

        return Inertia::render('Stocks/Index', [
            'stocks' => $stocks,
        ]);
    }
}
