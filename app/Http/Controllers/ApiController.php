<?php

namespace App\Http\Controllers;

use App\Services\CoinGeckoService;
use App\Services\YahooFinanceService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ApiController extends Controller
{
    public function __construct(
        private CoinGeckoService $coinGecko,
        private YahooFinanceService $yahoo,
    ) {}

    public function search(Request $request): JsonResponse
    {
        $query = $request->get('q', '');

        if (strlen($query) < 2) {
            return response()->json(['coins' => []]);
        }

        $results = $this->coinGecko->search($query);

        return response()->json($results);
    }

    public function chart(Request $request, string $id): JsonResponse
    {
        $days = (int) $request->get('days', 7);
        $currency = $request->get('currency', 'usd');
        $data = $this->coinGecko->getCoinMarketChart($id, $currency, $days);

        return response()->json($data);
    }

    public function global(): JsonResponse
    {
        return response()->json($this->coinGecko->getGlobalData());
    }

    public function stockSearch(Request $request): JsonResponse
    {
        $query = $request->get('q', '');

        if (strlen($query) < 1) {
            return response()->json([]);
        }

        return response()->json($this->yahoo->searchTsx($query));
    }
}
