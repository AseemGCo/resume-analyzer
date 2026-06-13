// Circular SVG gauge. Color band: red < 50, amber 50-74, green >= 75.
function bandColor(score) {
  if (score >= 75) return '#16a34a'; // green-600
  if (score >= 50) return '#d97706'; // amber-600
  return '#dc2626'; // red-600
}

export default function ScoreGauge({ score = 0, label = 'Overall Score' }) {
  const safe = Math.max(0, Math.min(100, Number(score) || 0));
  const radius = 70;
  const stroke = 14;
  const normalizedRadius = radius - stroke / 2;
  const circumference = 2 * Math.PI * normalizedRadius;
  const offset = circumference - (safe / 100) * circumference;
  const color = bandColor(safe);

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: radius * 2, height: radius * 2 }}>
        <svg width={radius * 2} height={radius * 2} className="-rotate-90">
          <circle
            cx={radius}
            cy={radius}
            r={normalizedRadius}
            fill="transparent"
            stroke="#e5e7eb"
            strokeWidth={stroke}
          />
          <circle
            cx={radius}
            cy={radius}
            r={normalizedRadius}
            fill="transparent"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.8s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold" style={{ color }}>
            {safe}
          </span>
          <span className="text-xs text-gray-400">/ 100</span>
        </div>
      </div>
      <span className="mt-2 text-sm font-medium text-gray-600">{label}</span>
    </div>
  );
}
