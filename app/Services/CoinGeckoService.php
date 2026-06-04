<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

class CoinGeckoService
{
    private string $baseUrl = 'https://api.coingecko.com/api/v3';

    private function get(string $endpoint, array $params = []): array
    {
        $cacheKey = 'coingecko_'.md5($endpoint.serialize($params));

        return Cache::remember($cacheKey, 60, function () use ($endpoint, $params) {
            $response = Http::timeout(15)
                ->retry(2, 500)
                ->get($this->baseUrl.$endpoint, $params);

            return $response->successful() ? $response->json() : [];
        });
    }

    public function getGlobalData(): array
    {
        $data = $this->get('/global');

        return $data['data'] ?? [];
    }

    public function getCoins(int $page = 1, string $currency = 'usd', int $perPage = 100): array
    {
        return $this->get('/coins/markets', [
            'vs_currency' => $currency,
            'order' => 'market_cap_desc',
            'per_page' => $perPage,
            'page' => $page,
            'sparkline' => true,
            'price_change_percentage' => '1h,24h,7d',
        ]);
    }

    public function getCoin(string $id): array
    {
        return $this->get("/coins/{$id}", [
            'localization' => false,
            'tickers' => false,
            'market_data' => true,
            'community_data' => false,
            'developer_data' => false,
            'sparkline' => true,
        ]);
    }

    public function getCoinMarketChart(string $id, string $currency = 'usd', int $days = 7): array
    {
        return $this->get("/coins/{$id}/market_chart", [
            'vs_currency' => $currency,
            'days' => $days,
        ]);
    }

    public function getTrending(): array
    {
        $data = $this->get('/search/trending');

        return $data['coins'] ?? [];
    }

    public function search(string $query): array
    {
        return $this->get('/search', ['query' => $query]);
    }

    public function getCategories(): array
    {
        return $this->get('/coins/categories/list');
    }
}
