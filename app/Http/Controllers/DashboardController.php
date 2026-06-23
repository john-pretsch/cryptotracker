<?php

namespace App\Http\Controllers;

use App\Services\CoinGeckoService;
use App\Services\YahooFinanceService;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct(
        private YahooFinanceService $yahoo,
        private CoinGeckoService $coingecko,
    ) {}

    public function index(): Response
    {
        // Yahoo Finance indicators (crude oil, gold, forex)
        $yahooIndicators = $this->yahoo->getDashboardIndicators();

        // Major equity indices
        $indices = $this->yahoo->getDashboardIndices();

        // Bitcoin via CoinGecko (includes 7-day sparkline)
        $btcCoins = $this->coingecko->getCoins(1, 'usd', 1);
        $btc = $btcCoins[0] ?? null;

        $bitcoin = [
            'id'            => 'bitcoin',
            'name'          => 'Bitcoin',
            'symbol'        => 'BTC',
            'unit'          => 'USD',
            'color'         => 'amber',
            'price'         => $btc['current_price'] ?? null,
            'change'        => null,
            'changePercent' => $btc['price_change_percentage_24h'] ?? null,
            'sparkline'     => $btc['sparkline_in_7d']['price'] ?? [],
        ];

        // Downsample BTC sparkline to ~20 points to match other indicators
        if (count($bitcoin['sparkline']) > 20) {
            $raw   = $bitcoin['sparkline'];
            $step  = (int) floor(count($raw) / 20);
            $bitcoin['sparkline'] = array_values(
                array_map(fn ($i) => $raw[$i], range(0, count($raw) - 1, max(1, $step)))
            );
        }

        $indicators = array_merge(['bitcoin' => $bitcoin], $yahooIndicators);

        return Inertia::render('Dashboard', [
            'indicators' => $indicators,
            'indices'    => $indices,
        ]);
    }
}
