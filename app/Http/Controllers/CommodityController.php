<?php

namespace App\Http\Controllers;

use App\Services\YahooFinanceService;
use Inertia\Inertia;
use Inertia\Response;

class CommodityController extends Controller
{
    public function __construct(private YahooFinanceService $yahoo) {}

    public function index(): Response
    {
        return Inertia::render('Commodities/Index', [
            'categories' => $this->yahoo->getCommodities(),
        ]);
    }
}
