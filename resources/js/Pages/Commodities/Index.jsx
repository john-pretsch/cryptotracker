import { Head } from '@inertiajs/react';
import { Wheat } from 'lucide-react';
import Layout from '../../Components/Layout';
import PriceChange from '../../Components/PriceChange';

const CATEGORY_COLORS = {
    Energy:      'text-orange-400 border-orange-500/30 bg-orange-500/5',
    Metals:      'text-yellow-400 border-yellow-500/30 bg-yellow-500/5',
    Agriculture: 'text-green-400  border-green-500/30  bg-green-500/5',
    Livestock:   'text-rose-400   border-rose-500/30   bg-rose-500/5',
};

const CATEGORY_ICONS = {
    Energy:      '⚡',
    Metals:      '🪙',
    Agriculture: '🌾',
    Livestock:   '🐄',
};

/** Yahoo Finance quotes USX (US cents) for grains & livestock. Convert to dollars for display. */
function formatPrice(price, currency, unit) {
    if (price == null) return '—';
    // USX = US cents — display in cents with the unit label
    if (currency === 'USX') {
        return `${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}¢`;
    }
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 4,
    }).format(price);
}

function formatChange(change, currency) {
    if (change == null) return '—';
    const sign = change >= 0 ? '+' : '';
    const suffix = currency === 'USX' ? '¢' : '';
    return `${sign}${change.toFixed(currency === 'USX' ? 2 : 4)}${suffix}`;
}

function CommodityRow({ item }) {
    const positive = (item.regularMarketChangePercent ?? 0) >= 0;
    const cur = item.currency ?? 'USD';

    return (
        <tr className="hover:bg-gray-900/50 transition-colors group">
            <td className="px-4 py-3.5">
                <span className="font-mono text-xs font-semibold text-blue-400 group-hover:text-blue-300 transition-colors">
                    {item.symbol}
                </span>
            </td>
            <td className="px-4 py-3.5">
                <p className="text-white text-sm font-medium">{item.name}</p>
                <p className="text-gray-500 text-xs mt-0.5">{item.unit}</p>
            </td>
            <td className="px-4 py-3.5 text-right font-semibold text-white tabular-nums">
                {formatPrice(item.regularMarketPrice, cur, item.unit)}
            </td>
            <td className="px-4 py-3.5 text-right tabular-nums">
                <span className={positive ? 'text-green-400' : 'text-red-400'}>
                    {formatChange(item.regularMarketChange, cur)}
                </span>
            </td>
            <td className="px-4 py-3.5 text-right">
                <PriceChange value={item.regularMarketChangePercent} />
            </td>
            <td className="px-4 py-3.5 text-right text-gray-400 text-xs hidden md:table-cell tabular-nums">
                {item.regularMarketDayLow != null && item.regularMarketDayHigh != null
                    ? `${formatPrice(item.regularMarketDayLow, cur)} – ${formatPrice(item.regularMarketDayHigh, cur)}`
                    : '—'}
            </td>
            <td className="px-4 py-3.5 text-right text-gray-400 text-xs hidden lg:table-cell tabular-nums">
                {item.fiftyTwoWeekLow != null && item.fiftyTwoWeekHigh != null
                    ? `${formatPrice(item.fiftyTwoWeekLow, cur)} – ${formatPrice(item.fiftyTwoWeekHigh, cur)}`
                    : '—'}
            </td>
            <td className="px-4 py-3.5 text-right text-gray-400 text-xs hidden xl:table-cell tabular-nums">
                {item.regularMarketVolume != null ? item.regularMarketVolume.toLocaleString() : '—'}
            </td>
        </tr>
    );
}

function CategorySection({ name, items }) {
    const colorClass = CATEGORY_COLORS[name] ?? 'text-gray-400 border-gray-700 bg-gray-800/20';
    const icon = CATEGORY_ICONS[name] ?? '📦';

    return (
        <section className="mb-10">
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-semibold mb-4 ${colorClass}`}>
                <span>{icon}</span>
                <span>{name}</span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-gray-800">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-gray-800 bg-gray-900/50">
                            <th className="text-left px-4 py-3 text-gray-400 font-medium">Symbol</th>
                            <th className="text-left px-4 py-3 text-gray-400 font-medium">Commodity</th>
                            <th className="text-right px-4 py-3 text-gray-400 font-medium">Price</th>
                            <th className="text-right px-4 py-3 text-gray-400 font-medium">Change</th>
                            <th className="text-right px-4 py-3 text-gray-400 font-medium">Change %</th>
                            <th className="text-right px-4 py-3 text-gray-400 font-medium hidden md:table-cell">Day Range</th>
                            <th className="text-right px-4 py-3 text-gray-400 font-medium hidden lg:table-cell">52w Range</th>
                            <th className="text-right px-4 py-3 text-gray-400 font-medium hidden xl:table-cell">Volume</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800/50">
                        {items.map((item) => (
                            <CommodityRow key={item.symbol} item={item} />
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
}

export default function CommoditiesIndex({ categories }) {
    const totalCount = Object.values(categories).reduce((sum, items) => sum + items.length, 0);

    return (
        <Layout>
            <Head title="CME Commodities" />

            <div className="bg-gradient-to-b from-gray-900 to-gray-950 border-b border-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                    <div className="flex items-center gap-3 mb-3">
                        <Wheat className="w-7 h-7 text-yellow-400" />
                        <h1 className="text-3xl md:text-4xl font-bold text-white">
                            Commodities
                            <span className="text-yellow-400"> — Chicago Mercantile Exchange</span>
                        </h1>
                    </div>
                    <p className="text-gray-400">
                        Live futures prices for {totalCount} CME-listed commodities across {Object.keys(categories).length} categories.
                        Prices quoted in USD or US cents (¢) per the contract's standard unit.
                    </p>

                    {/* Category legend */}
                    <div className="flex flex-wrap gap-2 mt-4">
                        {Object.keys(categories).map((cat) => {
                            const colorClass = CATEGORY_COLORS[cat] ?? 'text-gray-400 border-gray-700';
                            return (
                                <a key={cat} href={`#cat-${cat.toLowerCase()}`}
                                   className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-medium transition-opacity hover:opacity-80 ${colorClass}`}>
                                    {CATEGORY_ICONS[cat]} {cat}
                                    <span className="opacity-60">({categories[cat].length})</span>
                                </a>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {Object.entries(categories).map(([name, items]) => (
                    <div key={name} id={`cat-${name.toLowerCase()}`}>
                        <CategorySection name={name} items={items} />
                    </div>
                ))}

                <p className="text-xs text-gray-600 text-right mt-2">
                    Futures data from Yahoo Finance · Near-month contracts · Cached 5 min
                </p>
            </div>
        </Layout>
    );
}
