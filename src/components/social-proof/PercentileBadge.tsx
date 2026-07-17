"use client";

import { useState, useEffect } from "react";
import { getScorePercentileAsync } from "@/lib/social-proof/getScorePercentile";

interface Props {
  score: number;
  className?: string;
}

export function PercentileBadge({ score, className = "" }: Props) {
  const [percentile, setPercentile] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    const t = setTimeout(() => {
      getScorePercentileAsync(score).then((p) => {
        if (!cancelled) setPercentile(p);
      });
    }, 800);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [score]);

  if (percentile === null) return null;

  const getCopy = (p: number) => {
    if (p >= 90) return `Top ${100 - p}% — elite signal`;
    if (p >= 75) return `Better than ${p}% of checks this week`;
    if (p >= 50) return `Above average — ${p}% scored lower`;
    if (p >= 25) return `${p}% scored higher — room to upgrade`;
    return `Bottom ${p}% — biggest upgrade potential`;
  };

  return (
    <div className={`animate-slide-in rounded-xl border border-red-500/15 bg-red-500/5 px-4 py-3 text-center ${className}`}>
      <div className="text-xs text-[#857b6e]">Your percentile</div>
      <div className="mt-1 text-sm font-medium text-red-300">
        {getCopy(percentile)}
      </div>
    </div>
  );
}
