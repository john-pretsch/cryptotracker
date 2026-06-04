export default function Sparkline({ data, positive }) {
    if (!data || data.length < 2) {
        return null;
    }

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const width = 80;
    const height = 30;
    const points = data.map((value, index) => {
        const x = (index / (data.length - 1)) * width;
        const y = height - ((value - min) / range) * height;

        return `${x},${y}`;
    }).join(' ');

    return (
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
            <polyline
                points={points}
                fill="none"
                stroke={positive ? '#4ade80' : '#f87171'}
                strokeWidth="1.5"
                strokeLinejoin="round"
            />
        </svg>
    );
}
