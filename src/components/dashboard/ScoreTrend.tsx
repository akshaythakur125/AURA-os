"use client";

import { useMemo } from "react";

interface Props {
  scores: { score: number; date: string }[];
  className?: string;
}

export function ScoreTrend({ scores, className = "" }: Props) {
  const pathData = useMemo(() => {
    if (scores.length < 2) return null;

    const sorted = [...scores].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const W = 400;
    const H = 120;
    const PAD_X = 10;
    const PAD_Y = 15;
    const plotW = W - PAD_X * 2;
    const plotH = H - PAD_Y * 2;

    const minScore = Math.max(0, Math.min(...sorted.map((s) => s.score)) - 5);
    const maxScore = Math.min(100, Math.max(...sorted.map((s) => s.score)) + 5);
    const range = maxScore - minScore || 1;

    const points = sorted.map((s, i) => {
      const x = PAD_X + (i / (sorted.length - 1)) * plotW;
      const y = PAD_Y + plotH - ((s.score - minScore) / range) * plotH;
      return { x, y, score: s.score, date: s.date };
    });

    const line = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

    const area = `${line} L ${points[points.length - 1].x} ${H} L ${points[0].x} ${H} Z`;

    return { W, H, line, area, points, minScore, maxScore };
  }, [scores]);

  if (!pathData) {
    return (
      <div className={`flex h-[120px] items-center justify-center text-xs text-[#9c9184] ${className}`}>
        Need 2+ audits to show trend
      </div>
    );
  }

  const first = pathData.points[0];
  const last = pathData.points[pathData.points.length - 1];
  const improved = last.score > first.score;
  const delta = last.score - first.score;

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-2">
        <div>
          <div className="text-xs text-[#857b6e]">Score Trend</div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#1C1917]">{last.score}</span>
            {delta !== 0 && (
              <span className={`text-xs font-medium ${improved ? "text-emerald-400" : "text-red-400"}`}>
                {improved ? "+" : ""}{delta} from first
              </span>
            )}
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-[#9c9184]">{pathData.points.length} checks</div>
        </div>
      </div>
      <svg
        viewBox={`0 0 ${pathData.W} ${pathData.H}`}
        className="w-full"
        style={{ height: 120 }}
      >
        <defs>
          <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgb(147, 51, 234)" stopOpacity="0.2" />
            <stop offset="100%" stopColor="rgb(147, 51, 234)" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="trendLine" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#9333ea" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
        </defs>
        <path d={pathData.area} fill="url(#trendFill)" />
        <path d={pathData.line} fill="none" stroke="url(#trendLine)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {pathData.points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={i === pathData.points.length - 1 ? 5 : 3}
            fill={i === pathData.points.length - 1 ? "#ec4899" : "#9333ea"}
            stroke={i === pathData.points.length - 1 ? "#fff" : "transparent"}
            strokeWidth="2"
          />
        ))}
      </svg>
    </div>
  );
}
