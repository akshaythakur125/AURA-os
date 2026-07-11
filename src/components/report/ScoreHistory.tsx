"use client";

import { useState, useEffect } from "react";
import { FadeInView } from "@/components/ui/FadeInView";

/**
 * Feature 7: Investment tracking — shows score history across retakes.
 * Stores in localStorage — no DB change needed.
 */
export function ScoreHistory({ currentScore }: { currentScore: number }) {
  const [history, setHistory] = useState<number[]>([]);

  useEffect(() => {
    const key = "aura_score_history";
    const stored = JSON.parse(localStorage.getItem(key) || "[]") as number[];
    // Add current score if not already the latest
    if (stored.length === 0 || stored[stored.length - 1] !== currentScore) {
      stored.push(currentScore);
      // Keep last 10
      const trimmed = stored.slice(-10);
      localStorage.setItem(key, JSON.stringify(trimmed));
      setHistory(trimmed);
    } else {
      setHistory(stored);
    }
  }, [currentScore]);

  if (history.length < 2) return null;

  const first = history[0];
  const last = history[history.length - 1];
  const delta = last - first;
  const trending = delta >= 0;

  return (
    <FadeInView>
      <div className="rounded-xl border border-emerald-500/15 bg-emerald-500/5 p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[11px] font-medium text-emerald-300">
            📈 Your progress
          </span>
          <span className={`text-[11px] font-bold ${trending ? "text-emerald-400" : "text-red-400"}`}>
            {trending ? "+" : ""}{delta} pts
          </span>
        </div>

        {/* Mini sparkline */}
        <div className="flex items-end gap-1" style={{ height: 40 }}>
          {history.map((s, i) => (
            <div key={i} className="flex flex-1 flex-col items-center gap-0.5">
              <div
                className={`w-full rounded-sm transition-all duration-500 ${
                  i === history.length - 1
                    ? "bg-gradient-to-t from-emerald-500 to-green-400"
                    : "bg-white/10"
                }`}
                style={{ height: `${(s / 100) * 36}px` }}
              />
              <span className="text-[8px] text-gray-600">{s}</span>
            </div>
          ))}
        </div>

        <p className="mt-2 text-[10px] text-gray-500">
          {history.length} scans tracked.{" "}
          {trending
            ? "You're improving — keep going."
            : "A few targeted fixes will bring this back up."}
        </p>
      </div>
    </FadeInView>
  );
}
