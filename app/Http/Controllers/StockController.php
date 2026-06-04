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

    public function index(Request $request, string $exchange = 'tsx'): Response
    {
        $label    = $this->yahoo->getExchangeLabel($exchange);
        $total    = $this->yahoo->getSymbolCount($exchange);
        $lastPage = max(1, (int) ceil($total / self::PER_PAGE));
        $page     = max(1, min((int) $request->query('page', 1), $lastPage));
        $stocks   = $this->yahoo->getQuotesPage($exchange, $page, self::PER_PAGE);

        return Inertia::render('Stocks/Index', [
            'stocks'           => $stocks,
            'exchange'         => $exchange,
            'exchangeShort'    => $label['short'],
            'exchangeFull'     => $label['full'],
            'currentPage'      => $page,
            'lastPage'         => $lastPage,
            'total'            => $total,
            'perPage'          => self::PER_PAGE,
        ]);
    }
}
