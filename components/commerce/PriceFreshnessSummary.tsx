"use client";

import { Card } from "@/components/ui/Card";
import { PriceFreshnessBadge } from "@/components/commerce/PriceFreshnessBadge";
import type { CommerceSearchItem } from "@/types/commerceSearch";

interface Props {
  items: CommerceSearchItem[];
  compact?: boolean;
}

export function PriceFreshnessSummary({ items, compact }: Props) {
  const counts = { fresh: 0, recent: 0, stale: 0, manual: 0, unknown: 0 };
  for (const item of items) {
    const status = item.priceFreshness;
    if (status in counts) (counts as Record<string, number>)[status]++;
  }

  const total = items.length;
  const freshPercent = total > 0 ? Math.round((counts.fresh / total) * 100) : 0;

  if (compact) {
    return (
      <div className="flex flex-wrap gap-2">
        {(["fresh", "recent", "stale", "manual", "unknown"] as const).map((status) => (
          <div key={status} className="flex items-center gap-1">
            <PriceFreshnessBadge status={status} showLabel={false} />
            <span className="text-xs text-gray-500">{counts[status]}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <Card>
      <h3 className="mb-4 text-sm font-semibold text-white">Price Freshness</h3>
      <div className="mb-4 h-2 w-full overflow-hidden rounded-full bg-white/10">
        <div className="flex h-full">
          {counts.fresh > 0 && (
            <div
              className="bg-emerald-500 transition-all"
              style={{ width: `${(counts.fresh / total) * 100}%` }}
            />
          )}
          {counts.recent > 0 && (
            <div
              className="bg-amber-500 transition-all"
              style={{ width: `${(counts.recent / total) * 100}%` }}
            />
          )}
          {counts.stale > 0 && (
            <div
              className="bg-red-500 transition-all"
              style={{ width: `${(counts.stale / total) * 100}%` }}
            />
          )}
          {counts.manual > 0 && (
            <div
              className="bg-blue-500 transition-all"
              style={{ width: `${(counts.manual / total) * 100}%` }}
            />
          )}
          {counts.unknown > 0 && (
            <div
              className="bg-gray-500 transition-all"
              style={{ width: `${(counts.unknown / total) * 100}%` }}
            />
          )}
        </div>
      </div>
      <div className="grid gap-2 sm:grid-cols-5">
        {(["fresh", "recent", "stale", "manual", "unknown"] as const).map((status) => (
          <div key={status} className="rounded-lg bg-white/5 p-2 text-center">
            <div className="text-lg font-bold text-white">{counts[status]}</div>
            <PriceFreshnessBadge status={status} />
          </div>
        ))}
      </div>
      <p className="mt-3 text-[10px] text-gray-500">
        {freshPercent}% of prices are fresh (checked within 24h)
      </p>
    </Card>
  );
}
