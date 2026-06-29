"use client";

import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { ChallengeEntry } from "@/types/challenge";

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  } catch {
    return iso;
  }
}

export function LocalLeaderboard({
  entries,
  maxDisplay = 10,
}: {
  entries: ChallengeEntry[];
  maxDisplay?: number;
}) {
  const sorted = [...entries]
    .filter((e) => e.auraScore !== undefined)
    .sort((a, b) => (b.auraScore ?? 0) - (a.auraScore ?? 0))
    .slice(0, maxDisplay);

  if (sorted.length === 0) {
    return (
      <Card>
        <h3 className="mb-2 text-sm font-semibold text-white">Local Leaderboard</h3>
        <p className="text-xs text-gray-500">No entries yet. Be the first to enter this challenge!</p>
      </Card>
    );
  }

  return (
    <Card>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">Local Leaderboard</h3>
        <span className="text-xs text-gray-500">Top {maxDisplay}</span>
      </div>
      <div className="space-y-2">
        {sorted.map((entry, idx) => (
          <div
            key={entry.id}
            className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2"
          >
            <div className="flex items-center gap-3">
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold ${
                  idx === 0
                    ? "bg-amber-500/20 text-amber-400"
                    : idx === 1
                      ? "bg-gray-400/20 text-gray-300"
                      : idx === 2
                        ? "bg-orange-500/20 text-orange-400"
                        : "bg-white/5 text-gray-600"
                }`}
              >
                {idx + 1}
              </span>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-medium text-white">{entry.auraScore}</span>
                  {entry.archetype && (
                    <Badge variant="premium" className="text-[9px] px-1.5 py-0">{entry.archetype}</Badge>
                  )}
                </div>
                {entry.biggestStatusLeak && (
                  <div className="text-[10px] text-gray-500">Leak: {entry.biggestStatusLeak}</div>
                )}
              </div>
            </div>
            <span className="text-[10px] text-gray-600">{formatDate(entry.createdAt)}</span>
          </div>
        ))}
      </div>
      <p className="mt-3 text-[10px] text-gray-600">
        Local leaderboard only. Public leaderboards require a backend later.
      </p>
    </Card>
  );
}
