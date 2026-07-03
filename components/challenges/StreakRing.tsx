"use client";

interface StreakRingProps {
  streak: number;
  size?: number;
}

function getRingColor(streak: number): string {
  if (streak >= 8) return "stroke-amber-400";
  if (streak >= 4) return "stroke-purple-400";
  return "stroke-sky-400";
}

function getGlowColor(streak: number): string {
  if (streak >= 8) return "rgba(251,191,36,0.2)";
  if (streak >= 4) return "rgba(192,132,252,0.2)";
  return "rgba(56,189,248,0.2)";
}

export function StreakRing({ streak, size = 120 }: StreakRingProps) {
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(streak, 30);
  const pct = Math.min(clamped / 30, 1);
  const offset = circumference * (1 - pct);
  const color = getRingColor(streak);
  const glow = getGlowColor(streak);

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="absolute" style={{ filter: `drop-shadow(0 0 8px ${glow})` }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          className={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: "stroke-dashoffset 0.6s ease-out" }}
        />
      </svg>
      <div className="flex flex-col items-center">
        <span className="text-2xl font-bold text-white">{streak}</span>
        {streak > 0 && <span className="text-sm leading-none" role="img" aria-label="flame">🔥</span>}
      </div>
    </div>
  );
}
