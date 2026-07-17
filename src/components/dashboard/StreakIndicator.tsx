"use client";

import { useMemo } from "react";

interface Props {
  audits: { createdAt: string; freeScore?: number }[];
}

export function StreakIndicator({ audits }: Props) {
  const streak = useMemo(() => {
    if (audits.length < 2) return null;

    const sorted = [...audits].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const latest = new Date(sorted[0].createdAt);
    const now = new Date();
    const daysSinceLatest = Math.floor(
      (now.getTime() - latest.getTime()) / (1000 * 60 * 60 * 24)
    );

    let streakCount = 1;
    let totalDays = 0;

    for (let i = 0; i < sorted.length - 1; i++) {
      const current = new Date(sorted[i].createdAt);
      const prev = new Date(sorted[i + 1].createdAt);
      const diff = Math.floor(
        (current.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (diff <= 14) {
        streakCount++;
        totalDays += diff;
      } else {
        break;
      }
    }

    const avgDaysBetween = streakCount > 1 ? totalDays / (streakCount - 1) : null;

    return {
      daysSinceLatest,
      streakCount,
      avgDaysBetween,
      latestDate: sorted[0].createdAt,
    };
  }, [audits]);

  if (!streak) {
    return (
      <div className="rounded-2xl border border-[#1c1917]/[0.08] bg-[#1c1917]/[0.02] p-4 text-center text-xs text-[#9c9184]">
        Complete 2+ checks to see your streak
      </div>
    );
  }

  const isRecent = streak.daysSinceLatest <= 7;
  const isStale = streak.daysSinceLatest > 30;

  return (
    <div className="rounded-2xl border border-[#1c1917]/[0.08] bg-[#1c1917]/[0.02] p-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs text-[#857b6e]">Days Since Last Check</div>
          <div className="mt-1 flex items-baseline gap-2">
            <span
              className={`text-3xl font-bold ${
                isRecent ? "text-emerald-400" : isStale ? "text-red-400" : "text-amber-400"
              }`}
            >
              {streak.daysSinceLatest}
            </span>
            <span className="text-xs text-[#857b6e]">days</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-[#857b6e]">Check Streak</div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-xl font-bold text-[#1C1917]">{streak.streakCount}</span>
            <span className="text-xs text-[#857b6e]">in a row</span>
          </div>
        </div>
      </div>
      {streak.avgDaysBetween && (
        <div className="mt-3 border-t border-[#1c1917]/[0.08] pt-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#9c9184]">Your pace</span>
            <span className="text-[#6f675e]">
              every ~{Math.round(streak.avgDaysBetween)} days
            </span>
          </div>
          {streak.daysSinceLatest > streak.avgDaysBetween * 1.5 && (
            <p className="mt-2 text-xs text-amber-400/80">
              You&apos;re overdue for a check. Keep the momentum going.
            </p>
          )}
          {streak.daysSinceLatest <= streak.avgDaysBetween && (
            <p className="mt-2 text-xs text-emerald-400/80">
              On track. You&apos;re maintaining your pace.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
