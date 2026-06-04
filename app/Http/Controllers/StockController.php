<?php

namespace App\Http\Controllers;

use App\Services\YahooFinanceService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StockController extends Controller
{
    private const PER_PAGE = 50;

    public function __construct(private YahooFinanceService $yahoo) {}

    public function index(Request $request): Response
    {
        $total    = $this->yahoo->getTsxSymbolCount();
        $lastPage = (int) ceil($total / self::PER_PAGE);
        $page     = max(1, min((int) $request->query('page', 1), $lastPage));
        $stocks   = $this->yahoo->getQuotesPage($page, self::PER_PAGE);

        return Inertia::render('Stocks/Index', [
            'stocks'      => $stocks,
            'currentPage' => $page,
            'lastPage'    => $lastPage,
            'total'       => $total,
            'perPage'     => self::PER_PAGE,
        ]);
    }
}
