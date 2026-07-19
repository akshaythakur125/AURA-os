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
 * Animated circular gauge — kept for backwards compatibility.
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

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={5} />
          <circle ref={circleRef} cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={getColor(value)} strokeWidth={5} strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={circumference} />
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

/** Big premium hero ring — the focal point of the report. */
function HeroRing({ score, size = 184 }: { score: number; size?: number }) {
  const circleRef = useRef<SVGCircleElement>(null);
  const stroke = 14;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.min(score / 100, 1));

  useEffect(() => {
    const el = circleRef.current;
    if (!el) return;
    el.style.strokeDashoffset = `${circumference}`;
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        el.style.transition = "stroke-dashoffset 1.5s cubic-bezier(0.16,1,0.3,1)";
        el.style.strokeDashoffset = `${offset}`;
      })
    );
  }, [offset, circumference]);

  const verdict =
    score >= 75 ? { t: "Strong", c: "text-emerald-400" } :
    score >= 55 ? { t: "Solid", c: "text-blue-400" } :
    score >= 40 ? { t: "Needs work", c: "text-amber-400" } :
    { t: "Weak signal", c: "text-rose-400" };

  return (
    <div className="relative mx-auto" style={{ width: size, height: size }}>
      <div className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(167,139,250,0.28),transparent_65%)] blur-xl" />
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id="auraRing" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#c4b5fd" />
            <stop offset="50%" stopColor="#60a5fa" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
        <circle ref={circleRef} cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="url(#auraRing)" strokeWidth={stroke} strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={circumference} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="bg-gradient-to-br from-white via-violet-100 to-violet-300 bg-clip-text text-5xl font-extrabold text-transparent">{score}</span>
        <span className="mt-0.5 text-xs text-gray-500">/ 100</span>
        <span className={`mt-1 text-[11px] font-semibold ${verdict.c}`}>{verdict.t}</span>
      </div>
    </div>
  );
}

/** One signal row with an animated gradient fill. */
function ScoreBar({ label, value, icon }: { label: string; value: number; icon: string }) {
  const rating = value >= 80 ? "Excellent" : value >= 65 ? "Good" : value >= 45 ? "Fair" : "Needs work";
  const color =
    value >= 80 ? "from-emerald-500 to-green-400" :
    value >= 65 ? "from-blue-500 to-cyan-400" :
    value >= 45 ? "from-amber-500 to-yellow-400" :
    "from-rose-500 to-orange-400";

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-[13px] font-medium text-gray-300">
          <span className="text-sm">{icon}</span> {label}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-wide text-gray-500">{rating}</span>
          <span className="w-6 text-right text-[13px] font-bold text-white">{value}</span>
        </div>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
        <div className={`h-full rounded-full bg-gradient-to-r ${color} transition-[width] duration-[1200ms] ease-out`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

/**
 * Premium visual score breakdown — hero ring + per-signal bars.
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

  const bars = [
    { label: "Lighting", value: lighting, icon: "💡" },
    { label: "Clarity", value: clarity, icon: "🔍" },
    { label: "Grooming", value: grooming, icon: "✂️" },
    { label: "Expression", value: expression, icon: "😊" },
    { label: "Composition", value: composition, icon: "📐" },
    { label: "Colour Balance", value: colorBalance, icon: "🎨" },
    { label: "Contrast", value: contrast, icon: "◐" },
    { label: "Symmetry", value: symmetry, icon: "⚖️" },
  ];

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-white/[0.02] p-6 sm:p-8">
      <div className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-violet-600/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-56 w-56 rounded-full bg-blue-600/10 blur-3xl" />

      <div className="relative">
        <div className="mb-6 text-center">
          <h3 className="bg-gradient-to-r from-white via-violet-100 to-violet-200 bg-clip-text text-xl font-bold text-transparent">
            Your Score Breakdown
          </h3>
          <p className="mt-1 text-xs text-gray-500">Every signal, rated against real profile-photo best practices.</p>
        </div>

        {/* Hero ring */}
        <div className="mb-8">
          <HeroRing score={overall} />
          <p className="mx-auto mt-4 max-w-sm text-center text-[13px] leading-relaxed text-gray-400">
            {overall >= 75 ? "Strong profile — only minor refinements left." :
             overall >= 55 ? "Decent foundation — 2–3 fixes make a big difference." :
             "Several signals need attention — follow the roadmap below."}
          </p>
        </div>

        {/* Signal bars */}
        <div className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
          {bars.map((b) => (
            <ScoreBar key={b.label} {...b} />
          ))}
        </div>
      </div>
    </div>
  );
}
