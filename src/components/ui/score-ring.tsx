export function ScoreRing({
  score,
  size = 64,
  strokeWidth = 4.5,
  label,
}: {
  score: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
}) {
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? "#10B981" : score >= 50 ? "#F59E0B" : "#EF4444";
  const numSize = size < 48 ? 11 : size < 64 ? 13 : size < 80 ? 16 : 18;
  const labelSize = size < 48 ? 4.5 : size < 64 ? 5 : 5.5;

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-border)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-semibold text-text-primary" style={{ fontSize: numSize }}>
          {score}
        </span>
        {label && (
          <span className="text-text-tertiary leading-none" style={{ fontSize: labelSize, textTransform: "uppercase", letterSpacing: 0.2 }}>
            {label}
          </span>
        )}
      </div>
    </div>
  );
}
