import IndicatorCard from '@/Components/IndicatorCard';
import Layout from '@/Components/Layout';
import { Head, Link } from '@inertiajs/react';

export default function Dashboard({ indicators = {}, indices = {} }) {
    const indicatorList = Object.entries(indicators);
    const indicesList   = Object.entries(indices);

    return (
        <Layout>
            <Head title="Dashboard" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <h1 className="text-2xl font-bold text-white mb-2">Dashboard</h1>
                <p className="text-gray-400 mb-8">Welcome back! You're logged in.</p>

                {indicatorList.length > 0 && (
                    <div className="mb-10">
                        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-4">
                            Market Indicators
                        </h2>
                        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {indicatorList.map(([id, indicator]) => (
                                <IndicatorCard key={id} id={id} {...indicator} />
                            ))}
                        </div>
                    </div>
                )}

                {indicesList.length > 0 && (
                    <div className="mb-10">
                        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-4">
                            Major Indices
                        </h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                            {indicesList.map(([id, index]) => (
                                <IndicatorCard key={id} id={id} {...index} />
                            ))}
                        </div>
                    </div>
                )}

                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-4">
                    Markets
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Link href="/coins" className="block p-6 bg-gray-900 border border-gray-800 rounded-xl hover:border-green-500 transition-colors">
                        <h2 className="text-lg font-semibold text-white mb-1">Cryptocurrencies</h2>
                        <p className="text-sm text-gray-400">Browse live crypto prices, charts and market data.</p>
                    </Link>
                    <Link href="/stocks/tsx" className="block p-6 bg-gray-900 border border-gray-800 rounded-xl hover:border-blue-500 transition-colors">
                        <h2 className="text-lg font-semibold text-white mb-1">TSX Stocks</h2>
                        <p className="text-sm text-gray-400">Browse all Toronto Stock Exchange listings.</p>
                    </Link>
                    <Link href="/stocks/nyse" className="block p-6 bg-gray-900 border border-gray-800 rounded-xl hover:border-blue-500 transition-colors">
                        <h2 className="text-lg font-semibold text-white mb-1">NYSE Stocks</h2>
                        <p className="text-sm text-gray-400">Browse all New York Stock Exchange listings.</p>
                    </Link>
                    <Link href="/stocks/nasdaq" className="block p-6 bg-gray-900 border border-gray-800 rounded-xl hover:border-blue-500 transition-colors">
                        <h2 className="text-lg font-semibold text-white mb-1">NASDAQ Stocks</h2>
                        <p className="text-sm text-gray-400">Browse all NASDAQ listings.</p>
                    </Link>
                </div>
            </div>
        </Layout>
    );
}
