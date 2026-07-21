"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { getAudits } from "@/lib/storage/auditStore";

interface Point {
  score: number;
  date: string;
}

const W = 320;
const H = 120;
const PAD = 10;

export function AuraTrend() {
  // localStorage-derived — render only after mount to avoid a hydration mismatch.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const points: Point[] = useMemo(() => {
    if (!mounted) return [];
    return getAudits()
      .map((a) => ({ score: (a.freeScore ?? a.fullScore) as number, date: a.createdAt }))
      .filter((p) => typeof p.score === "number")
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [mounted]);

  if (points.length < 2) {
    return (
      <Card className="text-center">
        <p className="text-sm font-semibold text-[#1C1917]">Aura Over Time</p>
        <p className="mx-auto mt-1 max-w-xs text-xs text-[#857b6e]">
          {points.length === 0
            ? "Run your first scan to start tracking your score."
            : "One scan so far — take another to see your trend line."}
        </p>
        <Link href="/audit/new">
          <Button variant="outline" size="sm" className="mt-3">New scan</Button>
        </Link>
      </Card>
    );
  }

  const scores = points.map((p) => p.score);
  const latest = scores[scores.length - 1];
  const first = scores[0];
  const delta = latest - first;
  const min = Math.max(0, Math.min(...scores) - 8);
  const max = Math.min(100, Math.max(...scores) + 8);
  const span = Math.max(1, max - min);

  const xy = points.map((p, i) => {
    const x = PAD + (i / (points.length - 1)) * (W - PAD * 2);
    const y = PAD + (1 - (p.score - min) / span) * (H - PAD * 2);
    return [x, y] as const;
  });
  const line = xy.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = `${line} L${xy[xy.length - 1][0].toFixed(1)},${H - PAD} L${xy[0][0].toFixed(1)},${H - PAD} Z`;

  return (
    <Card>
      <div className="mb-3 flex items-end justify-between">
        <div>
          <p className="text-xs text-[#857b6e]">Aura Over Time</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-[#1C1917]">{latest}</span>
            <span className={`text-xs font-medium ${delta >= 0 ? "text-emerald-600" : "text-[#E14434]"}`}>
              {delta >= 0 ? "▲ +" : "▼ "}{Math.abs(delta)} since first
            </span>
          </div>
          <p className="text-[11px] text-[#9c9184]">{points.length} scans</p>
        </div>
        <Link href="/audit/new">
          <Button variant="outline" size="sm">New scan</Button>
        </Link>
      </div>

      <div className="w-full overflow-x-auto">
        <svg viewBox={`0 0 ${W} ${H}`} className="h-32 w-full" preserveAspectRatio="none" role="img" aria-label="Score trend over time">
          <defs>
            <linearGradient id="auraTrendFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#E14434" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#E14434" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={area} fill="url(#auraTrendFill)" />
          <path d={line} fill="none" stroke="#E14434" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
          {xy.map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={i === xy.length - 1 ? 4 : 2.5} fill="#E14434" stroke="#fff" strokeWidth="1.5" />
          ))}
        </svg>
      </div>
    </Card>
  );
}
