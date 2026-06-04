<?php

namespace App\Http\Controllers;

use App\Services\CoinGeckoService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CoinController extends Controller
{
    public function __construct(private CoinGeckoService $coinGecko) {}

    public function index(Request $request): Response
    {
        $page = (int) $request->get('page', 1);
        $coins = $this->coinGecko->getCoins($page);
        $global = $this->coinGecko->getGlobalData();

        return Inertia::render('Coins/Index', [
            'coins' => $coins,
            'currentPage' => $page,
            'global' => $global,
        ]);
    }

    public function show(string $id): Response
    {
        $coin = $this->coinGecko->getCoin($id);
        $chart = $this->coinGecko->getCoinMarketChart($id, 'usd', 7);

        return Inertia::render('Coins/Show', [
            'coin' => $coin,
            'chartData' => $chart,
        ]);
    }
}
