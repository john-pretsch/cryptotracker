const COLOR_STYLES = {
    orange: { border: 'border-orange-500/30', text: 'text-orange-400', bg: 'bg-orange-500/10' },
    yellow: { border: 'border-yellow-500/30', text: 'text-yellow-400', bg: 'bg-yellow-500/10' },
    blue:   { border: 'border-blue-500/30',   text: 'text-blue-400',   bg: 'bg-blue-500/10'   },
    green:  { border: 'border-green-500/30',  text: 'text-green-400',  bg: 'bg-green-500/10'  },
    amber:  { border: 'border-amber-500/30',  text: 'text-amber-400',  bg: 'bg-amber-500/10'  },
};

function MiniSparkline({ data, positive }) {
    if (!data || data.length < 2) {
        return <div className="w-full h-12 bg-gray-800/50 rounded" />;
    }

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const W = 200;
    const H = 48;

    const pts = data.map((v, i) => {
        const x = (i / (data.length - 1)) * W;
        const y = H - ((v - min) / range) * H;
        return `${x},${y}`;
    });

    const stroke = positive ? '#4ade80' : '#f87171';
    const fill   = positive ? 'rgba(74,222,128,0.08)' : 'rgba(248,113,113,0.08)';

    const areaPoints = [
        `0,${H}`,
        ...pts,
        `${W},${H}`,
    ].join(' ');

    return (
        <svg
            viewBox={`0 0 ${W} ${H}`}
            className="w-full h-12"
            preserveAspectRatio="none"
        >
            <polygon points={areaPoints} fill={fill} />
            <polyline
                points={pts.join(' ')}
                fill="none"
                stroke={stroke}
                strokeWidth="1.5"
                strokeLinejoin="round"
                strokeLinecap="round"
            />
        </svg>
    );
}

function formatPrice(price, id) {
    if (price == null) return '—';

    if (id === 'eur_usd' || id === 'usd_cad') {
        return price.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 });
    }

    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(price);
}

export default function IndicatorCard({ id, name, unit, color = 'blue', price, changePercent, sparkline }) {
    const positive = (changePercent ?? 0) >= 0;
    const styles   = COLOR_STYLES[color] ?? COLOR_STYLES.blue;

    return (
        <div className={`bg-gray-900 border rounded-xl overflow-hidden ${styles.border}`}>
            <div className="px-4 pt-4 pb-2 flex items-start justify-between gap-2">
                <div className="min-w-0">
                    <p className={`text-xs font-semibold uppercase tracking-wide ${styles.text}`}>{name}</p>
                    <p className="text-lg font-bold text-white tabular-nums mt-0.5">
                        {formatPrice(price, id)}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">{unit}</p>
                </div>
                {changePercent != null && (
                    <span className={`shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full ${styles.bg} ${positive ? 'text-green-400' : 'text-red-400'}`}>
                        {positive ? '▲' : '▼'} {Math.abs(changePercent).toFixed(2)}%
                    </span>
                )}
            </div>

            <div className="px-0 pb-0">
                <MiniSparkline data={sparkline} positive={positive} />
            </div>
        </div>
    );
}
