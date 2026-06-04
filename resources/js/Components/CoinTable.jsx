import { Link } from '@inertiajs/react';
import PriceChange from './PriceChange';
import Sparkline from './Sparkline';

function formatCompact(value) {
    if (value === null || value === undefined) return '—';
    if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`;

    return `$${value.toFixed(2)}`;
}

function formatPrice(value) {
    if (value === null || value === undefined) return '—';
    if (value < 0.01) return `$${value.toFixed(6)}`;
    if (value < 1) return `$${value.toFixed(4)}`;

    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 2,
    }).format(value);
}

export default function CoinTable({ coins }) {
    if (!coins || coins.length === 0) {
        return <div className="text-center py-16 text-gray-500">No data available</div>;
    }

    return (
        <div className="overflow-x-auto rounded-xl border border-gray-800">
            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b border-gray-800 bg-gray-900/50">
                        <th className="text-left px-4 py-3 text-gray-400 font-medium w-8">#</th>
                        <th className="text-left px-4 py-3 text-gray-400 font-medium">Name</th>
                        <th className="text-right px-4 py-3 text-gray-400 font-medium">Price</th>
                        <th className="text-right px-4 py-3 text-gray-400 font-medium hidden sm:table-cell">1h %</th>
                        <th className="text-right px-4 py-3 text-gray-400 font-medium">24h %</th>
                        <th className="text-right px-4 py-3 text-gray-400 font-medium hidden md:table-cell">7d %</th>
                        <th className="text-right px-4 py-3 text-gray-400 font-medium hidden lg:table-cell">Market Cap</th>
                        <th className="text-right px-4 py-3 text-gray-400 font-medium hidden lg:table-cell">Volume (24h)</th>
                        <th className="text-right px-4 py-3 text-gray-400 font-medium hidden xl:table-cell">7d Chart</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/50">
                    {coins.map((coin) => (
                        <tr key={coin.id} className="hover:bg-gray-900/40 transition-colors group">
                            <td className="px-4 py-3.5 text-gray-500">{coin.market_cap_rank}</td>
                            <td className="px-4 py-3.5">
                                <Link href={`/coins/${coin.id}`} className="flex items-center gap-3">
                                    <img src={coin.image} alt={coin.name} className="w-8 h-8 rounded-full flex-shrink-0" />
                                    <div>
                                        <span className="font-medium text-white group-hover:text-green-400 transition-colors">{coin.name}</span>
                                        <span className="block text-xs text-gray-500 uppercase">{coin.symbol}</span>
                                    </div>
                                </Link>
                            </td>
                            <td className="px-4 py-3.5 text-right font-medium text-white">{formatPrice(coin.current_price)}</td>
                            <td className="px-4 py-3.5 text-right hidden sm:table-cell">
                                <PriceChange value={coin.price_change_percentage_1h_in_currency} />
                            </td>
                            <td className="px-4 py-3.5 text-right">
                                <PriceChange value={coin.price_change_percentage_24h} />
                            </td>
                            <td className="px-4 py-3.5 text-right hidden md:table-cell">
                                <PriceChange value={coin.price_change_percentage_7d_in_currency} />
                            </td>
                            <td className="px-4 py-3.5 text-right text-gray-300 hidden lg:table-cell">{formatCompact(coin.market_cap)}</td>
                            <td className="px-4 py-3.5 text-right text-gray-300 hidden lg:table-cell">{formatCompact(coin.total_volume)}</td>
                            <td className="px-4 py-3.5 text-right hidden xl:table-cell">
                                <Sparkline
                                    data={coin.sparkline_in_7d?.price}
                                    positive={(coin.price_change_percentage_7d_in_currency ?? 0) >= 0}
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
