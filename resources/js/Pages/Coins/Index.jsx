import { Head, router } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import CoinTable from '../../Components/CoinTable';
import Layout from '../../Components/Layout';
import MarketStats from '../../Components/MarketStats';

function formatCompact(value) {
    if (value === null || value === undefined) return '—';
    if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;

    return `$${value.toLocaleString()}`;
}

export default function CoinsIndex({ coins, currentPage, global }) {
    function goToPage(page) {
        router.visit(`/coins?page=${page}`, { preserveScroll: false });
    }

    const startPage = Math.max(1, currentPage - 2);
    const pages = [...Array(5)].map((_, index) => startPage + index);

    return (
        <Layout>
            <Head title="Cryptocurrency Prices" />
            <MarketStats global={global} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-white">Cryptocurrency Prices by Market Cap</h1>
                    <p className="text-gray-400 mt-1 text-sm">
                        The global cryptocurrency market cap today is {formatCompact(global?.total_market_cap?.usd)}. Showing top {coins?.length ?? 0} coins by market cap.
                    </p>
                </div>

                <CoinTable coins={coins} />

                <div className="flex items-center justify-center gap-3 mt-8 flex-wrap">
                    <button
                        type="button"
                        onClick={() => goToPage(currentPage - 1)}
                        disabled={currentPage <= 1}
                        className="flex items-center gap-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg text-sm text-white transition-colors"
                    >
                        <ChevronLeft className="w-4 h-4" /> Previous
                    </button>
                    <div className="flex items-center gap-2">
                        {pages.map((page) => (
                            <button
                                key={page}
                                type="button"
                                onClick={() => goToPage(page)}
                                className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                                    page === currentPage
                                        ? 'bg-green-500 text-white'
                                        : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                                }`}
                            >
                                {page}
                            </button>
                        ))}
                    </div>
                    <button
                        type="button"
                        onClick={() => goToPage(currentPage + 1)}
                        className="flex items-center gap-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm text-white transition-colors"
                    >
                        Next <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </Layout>
    );
}
