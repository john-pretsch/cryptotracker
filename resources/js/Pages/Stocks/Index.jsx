import { Head, router } from '@inertiajs/react';
import axios from 'axios';
import { BarChart2, ChevronLeft, ChevronRight, Search, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import Layout from '../../Components/Layout';
import StockTable from '../../Components/StockTable';

const PLACEHOLDERS = {
    tsx:    'Search by name or symbol (e.g. Shopify, RY, Canadian Tire…)',
    nyse:   'Search by name or symbol (e.g. JPMorgan, GS, ExxonMobil…)',
    nasdaq: 'Search by name or symbol (e.g. Apple, NVDA, Microsoft…)',
};

const LISTING_SOURCE = {
    tsx:    'Listings sourced from TMX · Quotes from Yahoo Finance · Cached 5 min',
    nyse:   'Listings sourced from Nasdaq Screener · Quotes from Yahoo Finance · Cached 5 min',
    nasdaq: 'Listings sourced from Nasdaq Screener · Quotes from Yahoo Finance · Cached 5 min',
};

export default function StocksIndex({ stocks, exchange, exchangeShort, exchangeFull, currentPage, lastPage, total }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const timerRef = useRef(null);

    const basePath = `/stocks/${exchange}`;

    const search = useCallback(async (q) => {
        if (!q.trim()) { setResults(null); setError(''); return; }
        setLoading(true);
        setError('');
        try {
            const { data } = await axios.get(`/_api/stocks/search?q=${encodeURIComponent(q)}&exchange=${exchange}`);
            setResults(data);
            if (data.length === 0) setError(`No ${exchangeShort}-listed stocks matched your search.`);
        } catch {
            setError('Search failed. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [exchange, exchangeShort]);

    useEffect(() => {
        clearTimeout(timerRef.current);
        if (query.length === 0) { setResults(null); setError(''); return; }
        timerRef.current = setTimeout(() => search(query), 350);
        return () => clearTimeout(timerRef.current);
    }, [query, search]);

    // Reset search when exchange changes (navigating between pages)
    useEffect(() => { setQuery(''); setResults(null); setError(''); }, [exchange]);

    const displayed = results ?? stocks;
    const isSearching = query.length > 0;

    const goTo = (page) => router.get(basePath, { page });

    return (
        <Layout>
            <Head title={`${exchangeShort} Stock Prices`} />

            <div className="bg-gradient-to-b from-gray-900 to-gray-950 border-b border-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                    <div className="flex items-center gap-3 mb-3">
                        <BarChart2 className="w-7 h-7 text-blue-400" />
                        <h1 className="text-3xl md:text-4xl font-bold text-white">
                            {exchangeShort} Securities
                            <span className="text-blue-400"> — {exchangeFull}</span>
                        </h1>
                    </div>
                    <p className="text-gray-400 mb-6">
                        All {total.toLocaleString()} securities listed on the {exchangeShort}. Search by name or ticker, or browse by page.
                    </p>

                    <div className="relative max-w-lg">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder={PLACEHOLDERS[exchange] ?? 'Search by name or symbol…'}
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-10 py-2.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                        />
                        {query && (
                            <button type="button" onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                                <X className="w-4 h-4 text-gray-400 hover:text-white" />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-medium text-gray-400">
                        {loading && 'Searching…'}
                        {!loading && isSearching && !error && results !== null && (
                            <>{results.length} result{results.length !== 1 ? 's' : ''} for &ldquo;{query}&rdquo;</>
                        )}
                        {!loading && !isSearching && (
                            <>Page {currentPage} of {lastPage} &mdash; {total.toLocaleString()} securities</>
                        )}
                    </h2>
                </div>

                {error ? (
                    <div className="text-center py-16 text-gray-500">{error}</div>
                ) : (
                    <StockTable stocks={displayed} loading={loading} />
                )}

                {!isSearching && lastPage > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-6">
                        <button
                            onClick={() => goTo(currentPage - 1)}
                            disabled={currentPage <= 1}
                            className="flex items-center gap-1 px-3 py-1.5 rounded bg-gray-800 text-gray-300 text-sm disabled:opacity-40 hover:bg-gray-700 transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4" /> Prev
                        </button>

                        {Array.from({ length: Math.min(7, lastPage) }, (_, i) => {
                            let start = Math.max(1, currentPage - 3);
                            const end = Math.min(lastPage, start + 6);
                            start = Math.max(1, end - 6);
                            return start + i;
                        }).map((p) => (
                            <button
                                key={p}
                                onClick={() => goTo(p)}
                                className={`w-8 h-8 rounded text-sm transition-colors ${
                                    p === currentPage ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                }`}
                            >
                                {p}
                            </button>
                        ))}

                        <button
                            onClick={() => goTo(currentPage + 1)}
                            disabled={currentPage >= lastPage}
                            className="flex items-center gap-1 px-3 py-1.5 rounded bg-gray-800 text-gray-300 text-sm disabled:opacity-40 hover:bg-gray-700 transition-colors"
                        >
                            Next <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                )}

                <p className="text-xs text-gray-600 mt-4 text-right">
                    {LISTING_SOURCE[exchange]}
                </p>
            </div>
        </Layout>
    );
}
