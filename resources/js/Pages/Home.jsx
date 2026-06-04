import { Head, Link } from '@inertiajs/react';
import { ArrowRight, BarChart2, Flame, TrendingUp } from 'lucide-react';
import CoinTable from '../Components/CoinTable';
import Layout from '../Components/Layout';
import MarketStats from '../Components/MarketStats';
import PriceChange from '../Components/PriceChange';
import StockTable from '../Components/StockTable';

export default function Home({ global, trending, topCoins, topStocks }) {
    return (
        <Layout>
            <Head title="Cryptocurrency Prices & Market Cap" />
            <MarketStats global={global} />

            <div className="bg-gradient-to-b from-gray-900 to-gray-950 border-b border-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
                        Today&apos;s Cryptocurrency Prices
                        <span className="text-green-400"> by Market Cap</span>
                    </h1>
                    <p className="text-gray-400 text-lg">
                        Track live crypto prices, market caps, charts, and more.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {trending && trending.length > 0 && (
                    <section className="mb-10">
                        <div className="flex items-center gap-2 mb-4">
                            <Flame className="w-5 h-5 text-orange-400" />
                            <h2 className="text-lg font-semibold text-white">Trending Coins (24h)</h2>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {trending.slice(0, 8).map(({ item }) => (
                                <Link
                                    key={item.id}
                                    href={`/coins/${item.id}`}
                                    className="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-green-500/50 hover:bg-gray-900/80 transition-all group"
                                >
                                    <div className="flex items-center gap-3 mb-2">
                                        <img src={item.thumb} alt={item.name} className="w-8 h-8 rounded-full" />
                                        <div className="min-w-0">
                                            <p className="font-medium text-white text-sm group-hover:text-green-400 transition-colors truncate">{item.name}</p>
                                            <p className="text-xs text-gray-500 uppercase">{item.symbol}</p>
                                        </div>
                                        <span className="ml-auto text-xs text-gray-600">#{item.market_cap_rank}</span>
                                    </div>
                                    {item.data?.price_change_percentage_24h?.usd !== undefined && (
                                        <PriceChange value={item.data.price_change_percentage_24h.usd} className="text-sm" />
                                    )}
                                    {item.data?.price && (
                                        <p className="text-white text-sm font-medium mt-1">{item.data.price}</p>
                                    )}
                                </Link>
                            ))}
                        </div>
                    </section>
                )}

                <section>
                    <div className="flex items-center justify-between mb-4 gap-4">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-green-400" />
                            <h2 className="text-lg font-semibold text-white">Top Cryptocurrencies</h2>
                        </div>
                        <Link href="/coins" className="flex items-center gap-1 text-green-400 hover:text-green-300 text-sm font-medium transition-colors">
                            View All <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                    <CoinTable coins={topCoins} />
                </section>

                {topStocks && topStocks.length > 0 && (
                    <section className="mt-12">
                        <div className="flex items-center justify-between mb-4 gap-4">
                            <div className="flex items-center gap-2">
                                <BarChart2 className="w-5 h-5 text-blue-400" />
                                <h2 className="text-lg font-semibold text-white">Top TSX Stocks</h2>
                            </div>
                            <Link href="/stocks" className="flex items-center gap-1 text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors">
                                View All <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                        <StockTable stocks={topStocks} />
                    </section>
                )}
            </div>
        </Layout>
    );
}
