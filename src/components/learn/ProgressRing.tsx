"use client";

export default function ProgressRing({
  value,
  size = 56,
  stroke = 6,
  label,
}: {
  value: number; // 0..1
  size?: number;
  stroke?: number;
  label?: string;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(1, value));
  const offset = c * (1 - clamped);
  const boxStyle = { width: size, height: size };
  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={boxStyle}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          className="text-edge"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          className="text-brand transition-all duration-500"
        />
      </svg>
      <span className="absolute text-xs font-bold text-white">
        {label ?? `${Math.round(clamped * 100)}%`}
      </span>
    </div>
  );
}
