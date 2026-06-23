<?php

namespace App\Services;

use GuzzleHttp\Cookie\CookieJar;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

class YahooFinanceService
{
    private string $baseUrl = 'https://query1.finance.yahoo.com';

    private const TMX_DIRECTORY_URL     = 'https://www.tsx.com/json/company-directory/search/tsx/%5E*';
    private const NASDAQ_SCREENER_URL   = 'https://api.nasdaq.com/api/screener/stocks?tableonly=true&download=true&exchange=';

    private const EXCHANGE_LABELS = [
        'tsx'    => ['short' => 'TSX',    'full' => 'Toronto Stock Exchange'],
        'nyse'   => ['short' => 'NYSE',   'full' => 'New York Stock Exchange'],
        'nasdaq' => ['short' => 'NASDAQ', 'full' => 'NASDAQ'],
    ];

    /**
     * CME futures organised by category.
     * 'unit' is the human-readable price unit shown in the UI.
     * Prices quoted in USX (US cents) are flagged so the UI can convert/annotate them.
     */
    private const COMMODITY_CATEGORIES = [
        'Energy' => [
            ['symbol' => 'CL=F',  'name' => 'Crude Oil (WTI)',     'unit' => 'USD/barrel'],
            ['symbol' => 'BZ=F',  'name' => 'Crude Oil (Brent)',   'unit' => 'USD/barrel'],
            ['symbol' => 'NG=F',  'name' => 'Natural Gas',         'unit' => 'USD/MMBtu'],
            ['symbol' => 'RB=F',  'name' => 'RBOB Gasoline',       'unit' => 'USD/gallon'],
            ['symbol' => 'HO=F',  'name' => 'Heating Oil',         'unit' => 'USD/gallon'],
        ],
        'Metals' => [
            ['symbol' => 'GC=F',  'name' => 'Gold',                'unit' => 'USD/troy oz'],
            ['symbol' => 'SI=F',  'name' => 'Silver',              'unit' => 'USD/troy oz'],
            ['symbol' => 'HG=F',  'name' => 'Copper',              'unit' => 'USD/lb'],
            ['symbol' => 'PL=F',  'name' => 'Platinum',            'unit' => 'USD/troy oz'],
            ['symbol' => 'PA=F',  'name' => 'Palladium',           'unit' => 'USD/troy oz'],
        ],
        'Agriculture' => [
            ['symbol' => 'ZC=F',  'name' => 'Corn',                'unit' => '¢/bushel'],
            ['symbol' => 'ZW=F',  'name' => 'Wheat (SRW)',         'unit' => '¢/bushel'],
            ['symbol' => 'ZS=F',  'name' => 'Soybeans',            'unit' => '¢/bushel'],
            ['symbol' => 'ZL=F',  'name' => 'Soybean Oil',         'unit' => '¢/lb'],
            ['symbol' => 'ZM=F',  'name' => 'Soybean Meal',        'unit' => 'USD/short ton'],
            ['symbol' => 'ZO=F',  'name' => 'Oats',                'unit' => '¢/bushel'],
            ['symbol' => 'ZR=F',  'name' => 'Rough Rice',          'unit' => 'USD/cwt'],
        ],
        'Livestock' => [
            ['symbol' => 'LE=F',  'name' => 'Live Cattle',         'unit' => '¢/lb'],
            ['symbol' => 'GF=F',  'name' => 'Feeder Cattle',       'unit' => '¢/lb'],
            ['symbol' => 'HE=F',  'name' => 'Lean Hogs',           'unit' => '¢/lb'],
        ],
    ];

    /** Fallback symbols used when the TMX directory is unreachable. */
    private const FALLBACK_SYMBOLS = [
        'tsx'    => ['RY.TO', 'TD.TO', 'BNS.TO', 'BMO.TO', 'CNR.TO', 'ENB.TO', 'SU.TO', 'CP.TO', 'BCE.TO', 'TRP.TO'],
        'nyse'   => ['JPM', 'BAC', 'XOM', 'JNJ', 'WMT', 'PG', 'CVX', 'HD', 'KO', 'DIS'],
        'nasdaq' => ['AAPL', 'MSFT', 'AMZN', 'NVDA', 'GOOGL', 'META', 'TSLA', 'AVGO', 'COST', 'NFLX'],
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
    // Symbol discovery
    // -------------------------------------------------------------------------

    /**
     * Return all Yahoo-Finance-compatible symbols for the given exchange.
     * Results are cached for 24 hours; falls back to a hardcoded list on failure.
     */
    public function getAllSymbols(string $exchange): array
    {
        return match ($exchange) {
            'tsx'    => $this->getAllTsxSymbols(),
            'nyse'   => $this->getAllNasdaqScreenerSymbols('nyse'),
            'nasdaq' => $this->getAllNasdaqScreenerSymbols('nasdaq'),
            default  => [],
        };
    }

    public function getSymbolCount(string $exchange): int
    {
        return count($this->getAllSymbols($exchange));
    }

    public function getExchangeLabel(string $exchange): array
    {
        return self::EXCHANGE_LABELS[$exchange] ?? ['short' => strtoupper($exchange), 'full' => strtoupper($exchange)];
    }

    /**
     * Fetch and cache all Yahoo-Finance-compatible TSX symbols from the TMX directory.
     * Flattens per-listing instruments, removes USD variants, debentures, and warrants,
     * then converts TMX dot-notation (e.g. AKT.A) to Yahoo dash-notation (AKT-A.TO).
     */
    public function getAllTsxSymbols(): array
    {
        return Cache::remember('tsx_all_symbols', 86400, function () {
            $response = Http::timeout(15)
                ->withHeaders(['User-Agent' => self::USER_AGENT])
                ->get(self::TMX_DIRECTORY_URL);

            if (! $response->successful()) {
                return self::FALLBACK_SYMBOLS['tsx'];
            }

            $results = $response->json()['results'] ?? [];
            $symbols = [];

            foreach ($results as $listing) {
                foreach ($listing['instruments'] ?? [] as $instrument) {
                    $sym = $instrument['symbol'] ?? '';
                    if ($sym === '') {
                        continue;
                    }
                    if (str_ends_with($sym, '.U')
                        || str_contains($sym, '.DB')
                        || str_contains($sym, '.WT')
                        || str_contains($sym, '.WS')) {
                        continue;
                    }
                    $symbols[] = str_replace('.', '-', $sym).'.TO';
                }
            }

            return empty($symbols) ? self::FALLBACK_SYMBOLS['tsx'] : array_values(array_unique($symbols));
        });
    }

    /**
     * Fetch and cache all symbols for NYSE or NASDAQ via the Nasdaq screener API.
     * No suffix needed — Yahoo Finance uses raw US tickers (e.g. AAPL, JPM).
     */
    private function getAllNasdaqScreenerSymbols(string $exchange): array
    {
        $cacheKey = "{$exchange}_all_symbols";

        return Cache::remember($cacheKey, 86400, function () use ($exchange) {
            $response = Http::timeout(20)
                ->withHeaders(['User-Agent' => self::USER_AGENT])
                ->get(self::NASDAQ_SCREENER_URL.strtoupper($exchange));

            if (! $response->successful()) {
                return self::FALLBACK_SYMBOLS[$exchange];
            }

            $rows    = $response->json()['data']['rows'] ?? [];
            $symbols = array_filter(
                array_column($rows, 'symbol'),
                fn ($s) => $s !== null && $s !== '' && ! str_contains((string) $s, '/'),
            );

            return empty($symbols) ? self::FALLBACK_SYMBOLS[$exchange] : array_values(array_unique($symbols));
        });
    }

    // -------------------------------------------------------------------------
    // Public API
    // -------------------------------------------------------------------------

    private function quoteFields(): string
    {
        return implode(',', [
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
        ]);
    }

    /**
     * Fetch live quotes for the given symbols, batching in groups of 100.
     */
    public function getQuotes(array $symbols = []): array
    {
        if (empty($symbols)) {
            $symbols = $this->getAllTsxSymbols();
        }

        $results = [];
        foreach (array_chunk($symbols, 100) as $batch) {
            $data    = $this->get('/v7/finance/quote', ['symbols' => implode(',', $batch), 'fields' => $this->quoteFields()]);
            $results = array_merge($results, $data['quoteResponse']['result'] ?? []);
        }

        return $results;
    }

    /**
     * Fetch live quotes for one page of a given exchange's symbol list.
     */
    public function getQuotesPage(string $exchange, int $page = 1, int $perPage = 50): array
    {
        $allSymbols = $this->getAllSymbols($exchange);
        $pageSyms   = array_slice($allSymbols, ($page - 1) * $perPage, $perPage);

        if (empty($pageSyms)) {
            return [];
        }

        $data = $this->get('/v7/finance/quote', ['symbols' => implode(',', $pageSyms), 'fields' => $this->quoteFields()]);

        return $data['quoteResponse']['result'] ?? [];
    }

    public function getTopTsxStocks(int $limit = 10): array
    {
        return array_slice($this->getQuotesPage('tsx', 1, $limit), 0, $limit);
    }

    /**
     * Search securities on the given exchange by name or ticker symbol.
     */
    public function searchExchange(string $exchange, string $query): array
    {
        $creds     = $this->getCredentials();
        $cookieJar = CookieJar::fromArray($creds['cookies'], '.yahoo.com');

        $searchResp = Http::withOptions(['cookies' => $cookieJar])
            ->timeout(10)
            ->withHeaders(['User-Agent' => self::USER_AGENT])
            ->get($this->baseUrl.'/v1/finance/search', [
                'q'           => $query,
                'quotesCount' => 20,
                'newsCount'   => 0,
                'listsCount'  => 0,
                'crumb'       => $creds['crumb'],
            ]);

        if (! $searchResp->successful()) {
            return [];
        }

        $quotes  = $searchResp->json()['quotes'] ?? [];
        $symbols = array_column($quotes, 'symbol');

        // Filter to the target exchange
        $filtered = match ($exchange) {
            'tsx'    => array_values(array_filter($symbols, fn ($s) => str_ends_with((string) $s, '.TO'))),
            'nyse'   => array_values(array_filter($symbols, fn ($s) => ! str_contains((string) $s, '.') && ! str_contains((string) $s, '-'))),
            'nasdaq' => array_values(array_filter($symbols, fn ($s) => ! str_contains((string) $s, '.') && ! str_contains((string) $s, '-'))),
            default  => $symbols,
        };

        return empty($filtered) ? [] : $this->getQuotes($filtered);
    }

    /**
     * Fetch live quotes for all CME commodity futures, grouped by category.
     * Each item includes the static metadata (name, unit) merged with live quote data.
     *
     * @return array<string, list<array>>  Keys are category names.
     */
    public function getCommodities(): array
    {
        // Collect all symbols in one request
        $allSymbols = [];
        foreach (self::COMMODITY_CATEGORIES as $items) {
            foreach ($items as $item) {
                $allSymbols[] = $item['symbol'];
            }
        }

        $quotes = $this->getQuotes($allSymbols);
        $quoteMap = array_column($quotes, null, 'symbol');

        $grouped = [];
        foreach (self::COMMODITY_CATEGORIES as $category => $items) {
            $grouped[$category] = array_map(function (array $item) use ($quoteMap): array {
                $quote = $quoteMap[$item['symbol']] ?? [];

                return array_merge($item, [
                    'shortName'                    => $quote['shortName'] ?? $item['name'],
                    'regularMarketPrice'           => $quote['regularMarketPrice'] ?? null,
                    'regularMarketChange'          => $quote['regularMarketChange'] ?? null,
                    'regularMarketChangePercent'   => $quote['regularMarketChangePercent'] ?? null,
                    'regularMarketDayHigh'         => $quote['regularMarketDayHigh'] ?? null,
                    'regularMarketDayLow'          => $quote['regularMarketDayLow'] ?? null,
                    'fiftyTwoWeekHigh'             => $quote['fiftyTwoWeekHigh'] ?? null,
                    'fiftyTwoWeekLow'              => $quote['fiftyTwoWeekLow'] ?? null,
                    'regularMarketVolume'          => $quote['regularMarketVolume'] ?? null,
                    'currency'                     => $quote['currency'] ?? 'USD',
                    'marketState'                  => $quote['marketState'] ?? null,
                ]);
            }, $items);
        }

        return $grouped;
    }

    /**
     * Fetch the last N daily closing prices for a symbol (for sparklines).
     *
     * @return float[]  Array of closing prices, oldest first.
     */
    public function getSparkline(string $symbol, int $days = 14): array
    {
        $cacheKey = 'yahoo_sparkline_'.md5($symbol.$days);

        return Cache::remember($cacheKey, 300, function () use ($symbol, $days) {
            $creds    = $this->getCredentials();
            $response = $this->request(
                "/v8/finance/chart/{$symbol}",
                ['interval' => '1d', 'range' => "{$days}d"],
                $creds
            );

            if (! $response->successful()) {
                return [];
            }

            $closes = $response->json()['chart']['result'][0]['indicators']['quote'][0]['close'] ?? [];

            return array_values(array_filter(array_map(
                fn ($v) => $v !== null ? (float) $v : null,
                $closes
            ), fn ($v) => $v !== null));
        });
    }

    /**
     * Fetch quote + sparkline data for the dashboard financial indicators:
     * Crude Oil (WTI), Gold, EUR/USD, USD/CAD.
     *
     * @return array<string, array>  Keyed by indicator id.
     */
    public function getDashboardIndicators(): array
    {
        $symbols = ['CL=F', 'GC=F', 'EURUSD=X', 'USDCAD=X'];
        $quotes  = $this->getQuotes($symbols);
        $quoteMap = array_column($quotes, null, 'symbol');

        $definitions = [
            'crude_oil' => ['symbol' => 'CL=F',     'name' => 'Crude Oil (WTI)', 'unit' => 'USD/bbl',  'color' => 'orange'],
            'gold'      => ['symbol' => 'GC=F',     'name' => 'Gold',            'unit' => 'USD/oz',   'color' => 'yellow'],
            'eur_usd'   => ['symbol' => 'EURUSD=X', 'name' => 'EUR / USD',       'unit' => 'FX rate',  'color' => 'blue'],
            'usd_cad'   => ['symbol' => 'USDCAD=X', 'name' => 'USD / CAD',       'unit' => 'FX rate',  'color' => 'green'],
        ];

        $result = [];
        foreach ($definitions as $id => $def) {
            $q = $quoteMap[$def['symbol']] ?? [];
            $result[$id] = array_merge($def, [
                'price'         => $q['regularMarketPrice'] ?? null,
                'change'        => $q['regularMarketChange'] ?? null,
                'changePercent' => $q['regularMarketChangePercent'] ?? null,
                'sparkline'     => $this->getSparkline($def['symbol']),
            ]);
        }

        return $result;
    }

    /** @deprecated Use searchExchange() */
    public function searchTsx(string $query): array
    {
        return $this->searchExchange('tsx', $query);
    }

    public function getTsxSymbols(): array
    {
        return $this->getAllTsxSymbols();
    }
}
