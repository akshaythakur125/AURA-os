"use client";

import { useEffect, useState } from "react";
import { shouldUseSupabase } from "@/lib/storage/storageMode";

export function LeaderboardStrip() {
  const [percentile, setPercentile] = useState<number | null>(null);

  useEffect(() => {
    if (!shouldUseSupabase()) {
      setPercentile(68);
      return;
    }
    fetch("/api/challenges/leaderboard")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.percentile) setPercentile(data.percentile);
        else setPercentile(68);
      })
      .catch(() => {
        console.warn("Leaderboard fetch failed, using static fallback");
        setPercentile(68);
      });
  }, []);

  return (
    <div className="flex items-center gap-2 rounded-full border border-white/5 bg-white/[0.02] px-4 py-2 text-xs text-gray-400">
      <svg className="h-3.5 w-3.5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
      <span>
        You&rsquo;re ahead of <span className="font-semibold text-white">{percentile ?? 68}%</span> of users this week
      </span>
    </div>
  );
}
