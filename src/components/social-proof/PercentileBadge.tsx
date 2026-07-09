"use client";

import { useState, useEffect } from "react";

interface Props {
  percentile: number;
  className?: string;
}

export function PercentileBadge({ percentile, className = "" }: Props) {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShown(true), 800);
    return () => clearTimeout(t);
  }, []);

  if (!shown) return null;

  const getCopy = (p: number) => {
    if (p >= 90) return `Top ${100 - p}% — elite signal`;
    if (p >= 75) return `Better than ${p}% of checks this week`;
    if (p >= 50) return `Above average — ${p}% scored lower`;
    if (p >= 25) return `${p}% scored higher — room to upgrade`;
    return `Bottom ${p}% — biggest upgrade potential`;
  };

  return (
    <div className={`animate-slide-in rounded-xl border border-purple-500/15 bg-purple-500/5 px-4 py-3 text-center ${className}`}>
      <div className="text-xs text-gray-500">Your percentile</div>
      <div className="mt-1 text-sm font-medium text-purple-300">
        {getCopy(percentile)}
      </div>
    </div>
  );
}
