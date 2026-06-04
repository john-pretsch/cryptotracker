export default function PriceChange({ value, className = '' }) {
    if (value === null || value === undefined) {
        return <span className={`text-gray-500 ${className}`}>—</span>;
    }

    const positive = value >= 0;

    return (
        <span className={`${positive ? 'text-green-400' : 'text-red-400'} ${className}`}>
            {positive ? '▲' : '▼'} {Math.abs(value).toFixed(2)}%
        </span>
    );
}
