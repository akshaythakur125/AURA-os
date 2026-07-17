"use client";

import { useMemo } from "react";
import type { Audit } from "@/types/audit";

interface Props {
  audits: Audit[];
}

export function ImprovementCard({ audits }: Props) {
  const improvement = useMemo(() => {
    if (audits.length < 2) return null;

    const sorted = [...audits].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const latest = sorted[0];
    const previous = sorted.find(
      (a) => a.id !== latest.id && a.freeScore !== undefined
    );

    if (!latest.freeScore || !previous?.freeScore) return null;

    const latestScore = latest.freeScore;
    const prevScore = previous.freeScore;
    const totalDelta = latestScore - prevScore;

    if (totalDelta <= 0) return null;

    const bestDelta = latestScore - Math.min(...sorted.map((a) => a.freeScore ?? 100));

    return {
      totalDelta,
      latestScore,
      prevScore,
      bestDelta,
      latestDate: latest.createdAt,
    };
  }, [audits]);

  if (!improvement) return null;

  return (
    <div className="mb-8 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20">
              <svg className="h-3.5 w-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            </div>
            <span className="text-xs font-medium text-emerald-400">Improvement Detected</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-[#1C1917]">+{improvement.totalDelta}</span>
            <span className="text-sm text-[#6f675e]">points since your last check</span>
          </div>
        </div>
      </div>
      {improvement.bestDelta > 0 && (
        <div className="mt-3 border-t border-emerald-500/10 pt-3">
          <div className="text-xs text-[#857b6e]">Your best improvement</div>
          <div className="mt-1 text-sm text-emerald-400">
            +{improvement.bestDelta} points from your first check to your latest
          </div>
        </div>
      )}
    </div>
  );
}
