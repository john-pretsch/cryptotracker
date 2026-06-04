<?php

namespace App\Http\Controllers;

use App\Services\CoinGeckoService;
use App\Services\YahooFinanceService;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function __construct(
        private CoinGeckoService $coinGecko,
        private YahooFinanceService $yahoo,
    ) {}

    public function index(): Response
    {
        $global = $this->coinGecko->getGlobalData();
        $trending = $this->coinGecko->getTrending();
        $topCoins = $this->coinGecko->getCoins(1, 'usd', 10);
        $topStocks = $this->yahoo->getTopTsxStocks(10);

        return Inertia::render('Home', [
            'global' => $global,
            'trending' => $trending,
            'topCoins' => $topCoins,
            'topStocks' => $topStocks,
        ]);
    }
}
