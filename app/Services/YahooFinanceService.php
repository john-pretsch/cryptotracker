<?php

namespace App\Services;

use GuzzleHttp\Cookie\CookieJar;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

class YahooFinanceService
{
    private string $baseUrl = 'https://query1.finance.yahoo.com';

    private const TSX_SYMBOLS = [
        'RY.TO', 'TD.TO', 'BNS.TO', 'BMO.TO', 'CNR.TO',
        'ENB.TO', 'SU.TO', 'CP.TO', 'BCE.TO', 'TRP.TO',
        'MFC.TO', 'SLF.TO', 'ATD.TO', 'T.TO', 'SHOP.TO',
    ];

    private const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

    // -------------------------------------------------------------------------
    // Crumb-based authentication (no API key required)
    // -------------------------------------------------------------------------

    private function fetchCredentials(): array
    {
        $cookieJar = new CookieJar();

        Http::withOptions(['cookies' => $cookieJar, 'allow_redirects' => ['max' => 5]])
            ->withHeaders(['User-Agent' => self::USER_AGENT])
            ->get('https://fc.yahoo.com');

        $crumb = Http::withOptions(['cookies' => $cookieJar])
            ->withHeaders(['User-Agent' => self::USER_AGENT])
            ->get($this->baseUrl.'/v1/test/getcrumb')
            ->body();

        $cookies = [];
        foreach ($cookieJar as $cookie) {
            $cookies[$cookie->getName()] = $cookie->getValue();
        }

        return ['crumb' => trim($crumb), 'cookies' => $cookies];
    }

    private function getCredentials(): array
    {
        return Cache::remember('yahoo_credentials', 3600, fn () => $this->fetchCredentials());
    }

    private function request(string $endpoint, array $params, array $creds)
    {
        $cookieJar = CookieJar::fromArray($creds['cookies'], '.yahoo.com');

        return Http::withOptions(['cookies' => $cookieJar])
            ->timeout(15)
            ->retry(2, 500)
            ->withHeaders(['User-Agent' => self::USER_AGENT])
            ->get($this->baseUrl.$endpoint, array_merge($params, ['crumb' => $creds['crumb']]));
    }

    private function get(string $endpoint, array $params = []): array
    {
        $cacheKey = 'yahoo_'.md5($endpoint.serialize($params));

        return Cache::remember($cacheKey, 300, function () use ($endpoint, $params) {
            $creds    = $this->getCredentials();
            $response = $this->request($endpoint, $params, $creds);

            if ($response->status() === 401) {
                Cache::forget('yahoo_credentials');
                $creds    = $this->getCredentials();
                $response = $this->request($endpoint, $params, $creds);
            }

            return $response->successful() ? $response->json() : [];
        });
    }

    // -------------------------------------------------------------------------
    // Public API
    // -------------------------------------------------------------------------

    /**
     * Fetch live quotes for one or more symbols.
     */
    public function getQuotes(array $symbols = []): array
    {
        if (empty($symbols)) {
            $symbols = self::TSX_SYMBOLS;
        }

        $data = $this->get('/v7/finance/quote', [
            'symbols' => implode(',', $symbols),
            'fields'  => implode(',', [
                'shortName',
                'symbol',
                'regularMarketPrice',
                'regularMarketChange',
                'regularMarketChangePercent',
                'regularMarketVolume',
                'marketCap',
                'regularMarketDayHigh',
                'regularMarketDayLow',
                'fiftyTwoWeekLow',
                'fiftyTwoWeekHigh',
                'currency',
                'exchangeTimezoneName',
                'marketState',
            ]),
        ]);

        return $data['quoteResponse']['result'] ?? [];
    }

    public function getTopTsxStocks(int $limit = 10): array
    {
        return array_slice($this->getQuotes(), 0, $limit);
    }

    /**
     * Search all TSX-listed securities by name or ticker symbol.
     * Returns results enriched with live quote data.
     */
    public function searchTsx(string $query): array
    {
        // Step 1: search for matching instruments
        $creds     = $this->getCredentials();
        $cookieJar = CookieJar::fromArray($creds['cookies'], '.yahoo.com');

        $searchResp = Http::withOptions(['cookies' => $cookieJar])
            ->timeout(10)
            ->withHeaders(['User-Agent' => self::USER_AGENT])
            ->get($this->baseUrl.'/v1/finance/search', [
                'q'            => $query,
                'quotesCount'  => 20,
                'newsCount'    => 0,
                'listsCount'   => 0,
                'crumb'        => $creds['crumb'],
            ]);

        if (! $searchResp->successful()) {
            return [];
        }

        $quotes = $searchResp->json()['quotes'] ?? [];

        // Filter to TSX-listed equities only (.TO suffix)
        $tsxSymbols = array_values(array_filter(
            array_column($quotes, 'symbol'),
            fn ($sym) => str_ends_with((string) $sym, '.TO'),
        ));

        if (empty($tsxSymbols)) {
            return [];
        }

        // Step 2: fetch live quotes for matched symbols
        return $this->getQuotes($tsxSymbols);
    }

    public function getTsxSymbols(): array
    {
        return self::TSX_SYMBOLS;
    }
}
