"use client";

import { useEffect, useRef } from "react";

interface GaugeProps {
  value: number;
  max?: number;
  label: string;
  color?: string;
  size?: number;
}

/**
 * Animated circular gauge — premium feel, not boring progress bars.
 */
export function AuraGauge({ value, max = 100, label, color = "#a855f7", size = 100 }: GaugeProps) {
  const circleRef = useRef<SVGCircleElement>(null);
  const radius = (size - 10) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(value / max, 1);
  const offset = circumference * (1 - pct);

  useEffect(() => {
    const el = circleRef.current;
    if (!el) return;
    el.style.strokeDashoffset = `${circumference}`;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.style.transition = "stroke-dashoffset 1.4s cubic-bezier(0.4,0,0.2,1)";
        el.style.strokeDashoffset = `${offset}`;
      });
    });
  }, [offset, circumference]);

  const getColor = (v: number) => {
    if (v >= 70) return "#22c55e";
    if (v >= 45) return color;
    return "#ef4444";
  };

  const c = getColor(value);

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth={5}
          />
          <circle
            ref={circleRef}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={c}
            strokeWidth={5}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-bold text-white">{value}</span>
          <span className="text-[9px] text-gray-500">/ {max}</span>
        </div>
      </div>
      <span className="text-[10px] font-medium text-gray-400">{label}</span>
    </div>
  );
}

/**
 * Horizontal bar with animated fill and rating label.
 */
function ScoreBar({ label, value, icon }: { label: string; value: number; icon: string }) {
  const rating =
    value >= 80 ? "Excellent" : value >= 65 ? "Good" : value >= 45 ? "Fair" : "Needs Work";
  const color =
    value >= 80 ? "from-emerald-500 to-green-400" :
    value >= 65 ? "from-blue-500 to-cyan-400" :
    value >= 45 ? "from-amber-500 to-yellow-400" :
    "from-red-500 to-orange-400";

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400">
          {icon} {label}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-gray-500">{rating}</span>
          <span className="text-xs font-bold text-white">{value}</span>
        </div>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${color} transition-all duration-1200 ease-out`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

/**
 * Premium visual score breakdown — replaces basic metric bars.
 */
export function ScoreBreakdown({
  lighting,
  clarity,
  composition,
  contrast,
  grooming,
  expression,
  symmetry,
  colorBalance,
}: {
  lighting: number;
  clarity: number;
  composition: number;
  contrast: number;
  grooming: number;
  expression: number;
  symmetry: number;
  colorBalance: number;
}) {
  const overall = Math.round((lighting + clarity + composition + contrast + grooming + expression + symmetry + colorBalance) / 8);

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
      <div className="mb-4 text-center">
        <h3 className="text-sm font-bold text-white">Your Score Breakdown</h3>
        <p className="text-[10px] text-gray-500">Each area rated against profile photo best practices</p>
      </div>

      {/* Circular gauges row */}
      <div className="mb-5 flex justify-center gap-4">
        <AuraGauge value={lighting} label="Lighting" />
        <AuraGauge value={grooming} label="Grooming" />
        <AuraGauge value={expression} label="Expression" />
      </div>

      {/* Detailed bars */}
      <div className="space-y-3">
        <ScoreBar label="Lighting" value={lighting} icon="💡" />
        <ScoreBar label="Clarity" value={clarity} icon="🔍" />
        <ScoreBar label="Grooming" value={grooming} icon="✂️" />
        <ScoreBar label="Expression" value={expression} icon="😊" />
        <ScoreBar label="Composition" value={composition} icon="📐" />
        <ScoreBar label="Color Balance" value={colorBalance} icon="🎨" />
        <ScoreBar label="Contrast" value={contrast} icon="◐" />
        <ScoreBar label="Symmetry" value={symmetry} icon="⚖️" />
      </div>

      {/* Overall summary */}
      <div className="mt-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 p-3 text-center">
        <div className="text-xs text-gray-400">Overall Aura Score</div>
        <div className="text-2xl font-bold text-white">{overall}<span className="text-sm text-gray-500"> / 100</span></div>
        <div className="text-[10px] text-gray-500">
          {overall >= 75 ? "Strong profile — minor refinements needed" :
           overall >= 55 ? "Decent foundation — 2-3 fixes will make a big difference" :
           "Multiple areas need attention — follow the roadmap below"}
        </div>
      </div>
    </div>
  );
}
