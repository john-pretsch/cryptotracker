export default function MarketStats({ global }) {
    if (!global || Object.keys(global).length === 0) {
        return null;
    }

    const totalMarketCap = global.total_market_cap?.usd;
    const totalVolume = global.total_volume?.usd;
    const btcDominance = global.market_cap_percentage?.btc;
    const ethDominance = global.market_cap_percentage?.eth;
    const activeCryptos = global.active_cryptocurrencies;
    const marketCapChange = global.market_cap_change_percentage_24h_usd;

    const formatCurrency = (value, short = true) => {
        if (value === null || value === undefined) {
            return '—';
        }

        if (short && value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
        if (short && value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
        if (short && value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;

        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0,
        }).format(value);
    };

    return (
        <div className="bg-gray-900 border-b border-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
                <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-gray-400">
                    <span>Cryptos: <span className="text-white">{activeCryptos?.toLocaleString()}</span></span>
                    <span>
                        Market Cap: <span className="text-white">{formatCurrency(totalMarketCap)}</span>
                        {marketCapChange !== undefined && (
                            <span className={marketCapChange >= 0 ? 'text-green-400 ml-1' : 'text-red-400 ml-1'}>
                                {marketCapChange >= 0 ? '▲' : '▼'} {Math.abs(marketCapChange).toFixed(1)}%
                            </span>
                        )}
                    </span>
                    <span>24h Vol: <span className="text-white">{formatCurrency(totalVolume)}</span></span>
                    <span>BTC: <span className="text-white">{btcDominance?.toFixed(1)}%</span></span>
                    <span>ETH: <span className="text-white">{ethDominance?.toFixed(1)}%</span></span>
                </div>
            </div>
        </div>
    );
}
