import PriceChange from './PriceChange';

function formatCompactCAD(value) {
    if (value === null || value === undefined) return '—';
    if (value >= 1e12) return `CA$${(value / 1e12).toFixed(2)}T`;
    if (value >= 1e9) return `CA$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `CA$${(value / 1e6).toFixed(2)}M`;
    if (value >= 1e3) return `CA$${(value / 1e3).toFixed(2)}K`;

    return `CA$${value.toFixed(2)}`;
}

function formatPrice(value, currency = 'CAD') {
    if (value === null || value === undefined) return '—';

    return new Intl.NumberFormat('en-CA', {
        style: 'currency',
        currency,
        maximumFractionDigits: 2,
    }).format(value);
}

export default function StockTable({ stocks, loading = false }) {
    if (loading) {
        return (
            <div className="overflow-x-auto rounded-xl border border-gray-800">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-gray-800 bg-gray-900/50">
                            <th className="text-left px-4 py-3 text-gray-400 font-medium">Symbol</th>
                            <th className="text-left px-4 py-3 text-gray-400 font-medium">Name</th>
                            <th className="text-right px-4 py-3 text-gray-400 font-medium">Price</th>
                            <th className="text-right px-4 py-3 text-gray-400 font-medium">Change</th>
                            <th className="text-right px-4 py-3 text-gray-400 font-medium">Change %</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800/50">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <tr key={i} className="animate-pulse">
                                <td className="px-4 py-3.5"><div className="h-4 w-16 bg-gray-800 rounded" /></td>
                                <td className="px-4 py-3.5"><div className="h-4 w-40 bg-gray-800 rounded" /></td>
                                <td className="px-4 py-3.5 text-right"><div className="h-4 w-16 bg-gray-800 rounded ml-auto" /></td>
                                <td className="px-4 py-3.5 text-right"><div className="h-4 w-12 bg-gray-800 rounded ml-auto" /></td>
                                <td className="px-4 py-3.5 text-right"><div className="h-4 w-12 bg-gray-800 rounded ml-auto" /></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    }

    if (!stocks || stocks.length === 0) {
        return <div className="text-center py-16 text-gray-500">No data available</div>;
    }

    return (
        <div className="overflow-x-auto rounded-xl border border-gray-800">
            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b border-gray-800 bg-gray-900/50">
                        <th className="text-left px-4 py-3 text-gray-400 font-medium">Symbol</th>
                        <th className="text-left px-4 py-3 text-gray-400 font-medium">Name</th>
                        <th className="text-right px-4 py-3 text-gray-400 font-medium">Price</th>
                        <th className="text-right px-4 py-3 text-gray-400 font-medium">Change</th>
                        <th className="text-right px-4 py-3 text-gray-400 font-medium">Change %</th>
                        <th className="text-right px-4 py-3 text-gray-400 font-medium hidden md:table-cell">Day Range</th>
                        <th className="text-right px-4 py-3 text-gray-400 font-medium hidden lg:table-cell">52w Range</th>
                        <th className="text-right px-4 py-3 text-gray-400 font-medium hidden lg:table-cell">Market Cap</th>
                        <th className="text-right px-4 py-3 text-gray-400 font-medium hidden xl:table-cell">Volume</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/50">
                    {stocks.map((stock) => {
                        const currency = stock.currency ?? 'CAD';
                        const positive = (stock.regularMarketChangePercent ?? 0) >= 0;

                        return (
                            <tr key={stock.symbol} className="hover:bg-gray-900/40 transition-colors group">
                                <td className="px-4 py-3.5">
                                    <span className="font-mono font-semibold text-blue-400 group-hover:text-blue-300 transition-colors">
                                        {stock.symbol}
                                    </span>
                                </td>
                                <td className="px-4 py-3.5 text-white text-sm">{stock.shortName ?? '—'}</td>
                                <td className="px-4 py-3.5 text-right font-medium text-white">
                                    {formatPrice(stock.regularMarketPrice, currency)}
                                </td>
                                <td className="px-4 py-3.5 text-right">
                                    <span className={positive ? 'text-green-400' : 'text-red-400'}>
                                        {stock.regularMarketChange != null
                                            ? `${positive ? '+' : ''}${stock.regularMarketChange.toFixed(2)}`
                                            : '—'}
                                    </span>
                                </td>
                                <td className="px-4 py-3.5 text-right">
                                    <PriceChange value={stock.regularMarketChangePercent} />
                                </td>
                                <td className="px-4 py-3.5 text-right text-gray-400 hidden md:table-cell text-xs">
                                    {stock.regularMarketDayLow != null && stock.regularMarketDayHigh != null
                                        ? `${formatPrice(stock.regularMarketDayLow, currency)} – ${formatPrice(stock.regularMarketDayHigh, currency)}`
                                        : '—'}
                                </td>
                                <td className="px-4 py-3.5 text-right text-gray-400 hidden lg:table-cell text-xs">
                                    {stock.fiftyTwoWeekLow != null && stock.fiftyTwoWeekHigh != null
                                        ? `${formatPrice(stock.fiftyTwoWeekLow, currency)} – ${formatPrice(stock.fiftyTwoWeekHigh, currency)}`
                                        : '—'}
                                </td>
                                <td className="px-4 py-3.5 text-right text-gray-300 hidden lg:table-cell">
                                    {formatCompactCAD(stock.marketCap)}
                                </td>
                                <td className="px-4 py-3.5 text-right text-gray-300 hidden xl:table-cell">
                                    {stock.regularMarketVolume != null
                                        ? stock.regularMarketVolume.toLocaleString()
                                        : '—'}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
