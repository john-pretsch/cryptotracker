import { Head, Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { AtSign, GitBranch, Globe } from 'lucide-react';
import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import Layout from '../../Components/Layout';
import PriceChange from '../../Components/PriceChange';

function formatPrice(value) {
    if (value === null || value === undefined) return '—';
    if (value < 0.00001) return `$${value.toFixed(8)}`;
    if (value < 0.01) return `$${value.toFixed(6)}`;
    if (value < 1) return `$${value.toFixed(4)}`;

    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 2,
    }).format(value);
}

function formatCompact(value) {
    if (value === null || value === undefined) return '—';
    if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;

    return `$${value.toLocaleString()}`;
}

const PERIODS = [
    { label: '24H', days: 1 },
    { label: '7D', days: 7 },
    { label: '30D', days: 30 },
    { label: '90D', days: 90 },
    { label: '1Y', days: 365 },
];

function CustomTooltip({ active, payload }) {
    if (active && payload && payload.length) {
        const date = new Date(payload[0].payload.time);

        return (
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 text-xs shadow-xl">
                <p className="text-gray-400">{date.toLocaleDateString()} {date.toLocaleTimeString()}</p>
                <p className="text-white font-semibold mt-1">{formatPrice(payload[0].value)}</p>
            </div>
        );
    }

    return null;
}

export default function CoinShow({ coin, chartData: initialChartData }) {
    const [period, setPeriod] = useState(7);
    const [chartData, setChartData] = useState(initialChartData);
    const [loading, setLoading] = useState(false);

    const market = coin?.market_data;
    const price = market?.current_price?.usd;
    const change24h = market?.price_change_percentage_24h;
    const change7d = market?.price_change_percentage_7d;
    const change30d = market?.price_change_percentage_30d;
    const ath = market?.ath?.usd;
    const atl = market?.atl?.usd;
    const marketCap = market?.market_cap?.usd;
    const volume = market?.total_volume?.usd;
    const circulatingSupply = market?.circulating_supply;
    const totalSupply = market?.total_supply;
    const maxSupply = market?.max_supply;

    useEffect(() => {
        if (period === 7) {
            setChartData(initialChartData);
            return;
        }

        setLoading(true);
        axios.get(`/_api/chart/${coin.id}?days=${period}`)
            .then(({ data }) => setChartData(data))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [coin.id, initialChartData, period]);

    const prices = chartData?.prices?.map(([time, currentPrice]) => ({ time, price: currentPrice })) ?? [];
    const isPositive = (change24h ?? 0) >= 0;

    const description = coin?.description?.en
        ? coin.description.en.replace(/<[^>]+>/g, '').split('. ').slice(0, 4).join('. ').trim()
        : null;

    return (
        <Layout>
            <Head title={`${coin?.name} (${coin?.symbol?.toUpperCase()}) Price`} />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                    <Link href="/" className="hover:text-white transition-colors">Home</Link>
                    <span>/</span>
                    <Link href="/coins" className="hover:text-white transition-colors">Cryptocurrencies</Link>
                    <span>/</span>
                    <span className="text-gray-300">{coin?.name}</span>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    <div className="xl:col-span-1 space-y-6">
                        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                            <div className="flex items-center gap-4 mb-4">
                                <img src={coin?.image?.large} alt={coin?.name} className="w-16 h-16 rounded-full" />
                                <div>
                                    <h1 className="text-2xl font-bold text-white">{coin?.name}</h1>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-gray-400 uppercase font-medium">{coin?.symbol}</span>
                                        {coin?.market_cap_rank && (
                                            <span className="bg-gray-700 text-gray-300 text-xs px-2 py-0.5 rounded-md">
                                                Rank #{coin.market_cap_rank}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="mb-4">
                                <div className="text-3xl font-bold text-white">{formatPrice(price)}</div>
                                <div className="flex items-center gap-3 mt-1">
                                    <PriceChange value={change24h} className="text-base" />
                                    <span className="text-gray-500 text-sm">(24h)</span>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {coin?.links?.homepage?.[0] && (
                                    <a href={coin.links.homepage[0]} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs px-3 py-1.5 rounded-lg transition-colors">
                                        <Globe className="w-3 h-3" /> Website
                                    </a>
                                )}
                                {coin?.links?.repos_url?.github?.[0] && (
                                    <a href={coin.links.repos_url.github[0]} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs px-3 py-1.5 rounded-lg transition-colors">
                                        <GitBranch className="w-3 h-3" /> GitHub
                                    </a>
                                )}
                                {coin?.links?.twitter_screen_name && (
                                    <a href={`https://twitter.com/${coin.links.twitter_screen_name}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs px-3 py-1.5 rounded-lg transition-colors">
                                        <AtSign className="w-3 h-3" /> Twitter
                                    </a>
                                )}
                            </div>
                        </div>

                        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                            <h2 className="text-white font-semibold mb-4">{coin?.name} Market Stats</h2>
                            <dl className="space-y-3 text-sm">
                                {[
                                    { label: 'Market Cap', value: formatCompact(marketCap) },
                                    { label: '24h Volume', value: formatCompact(volume) },
                                    { label: 'ATH', value: formatPrice(ath) },
                                    { label: 'ATL', value: formatPrice(atl) },
                                    { label: 'Circulating Supply', value: circulatingSupply ? `${circulatingSupply.toLocaleString()} ${coin?.symbol?.toUpperCase()}` : '—' },
                                    { label: 'Total Supply', value: totalSupply ? `${totalSupply.toLocaleString()} ${coin?.symbol?.toUpperCase()}` : '∞' },
                                    { label: 'Max Supply', value: maxSupply ? `${maxSupply.toLocaleString()} ${coin?.symbol?.toUpperCase()}` : '∞' },
                                ].map(({ label, value }) => (
                                    <div key={label} className="flex justify-between items-center py-2 border-b border-gray-800 last:border-0 gap-4">
                                        <dt className="text-gray-400">{label}</dt>
                                        <dd className="text-white font-medium text-right">{value}</dd>
                                    </div>
                                ))}
                            </dl>
                        </div>

                        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                            <h2 className="text-white font-semibold mb-4">Price Change</h2>
                            <dl className="space-y-2 text-sm">
                                {[
                                    { label: '24h', value: change24h },
                                    { label: '7d', value: change7d },
                                    { label: '30d', value: change30d },
                                ].map(({ label, value }) => (
                                    <div key={label} className="flex justify-between items-center py-2 border-b border-gray-800 last:border-0">
                                        <dt className="text-gray-400">{label}</dt>
                                        <dd><PriceChange value={value} /></dd>
                                    </div>
                                ))}
                            </dl>
                        </div>
                    </div>

                    <div className="xl:col-span-2 space-y-6">
                        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                            <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
                                <h2 className="text-white font-semibold">{coin?.name} Price Chart (USD)</h2>
                                <div className="flex items-center gap-1 bg-gray-800 rounded-lg p-1">
                                    {PERIODS.map((item) => (
                                        <button
                                            key={item.days}
                                            type="button"
                                            onClick={() => setPeriod(item.days)}
                                            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                                                period === item.days ? 'bg-green-500 text-white' : 'text-gray-400 hover:text-white'
                                            }`}
                                        >
                                            {item.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            {loading ? (
                                <div className="h-64 flex items-center justify-center text-gray-500">Loading chart...</div>
                            ) : prices.length > 0 ? (
                                <ResponsiveContainer width="100%" height={300}>
                                    <AreaChart data={prices} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                                        <defs>
                                            <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor={isPositive ? '#4ade80' : '#f87171'} stopOpacity={0.15} />
                                                <stop offset="95%" stopColor={isPositive ? '#4ade80' : '#f87171'} stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                                        <XAxis
                                            dataKey="time"
                                            tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                            tick={{ fill: '#6b7280', fontSize: 11 }}
                                            tickCount={6}
                                            axisLine={false}
                                            tickLine={false}
                                        />
                                        <YAxis
                                            tickFormatter={(value) => formatPrice(value)}
                                            tick={{ fill: '#6b7280', fontSize: 11 }}
                                            domain={['auto', 'auto']}
                                            axisLine={false}
                                            tickLine={false}
                                            width={80}
                                        />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Area
                                            type="monotone"
                                            dataKey="price"
                                            stroke={isPositive ? '#4ade80' : '#f87171'}
                                            strokeWidth={2}
                                            fill="url(#priceGrad)"
                                            dot={false}
                                            activeDot={{ r: 4, fill: isPositive ? '#4ade80' : '#f87171' }}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-64 flex items-center justify-center text-gray-500">No chart data available</div>
                            )}
                        </div>

                        {description && (
                            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                                <h2 className="text-white font-semibold mb-3">About {coin?.name}</h2>
                                <p className="text-gray-400 text-sm leading-relaxed">{description.endsWith('.') ? description : `${description}.`}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
}
