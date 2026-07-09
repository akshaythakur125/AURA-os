"use client";

import type { PriceFreshnessStatus } from "@/types/priceFreshness";
import { FRESHNESS_LABELS, FRESHNESS_COLORS, FRESHNESS_ICONS } from "@/types/priceFreshness";

interface Props {
  status: PriceFreshnessStatus;
  className?: string;
  showLabel?: boolean;
}

export function PriceFreshnessBadge({ status, className = "", showLabel = true }: Props) {
  const color = FRESHNESS_COLORS[status];
  const icon = FRESHNESS_ICONS[status];
  const label = FRESHNESS_LABELS[status];

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${color} ${
        status === "stale"
          ? "bg-red-500/10"
          : status === "fresh"
            ? "bg-emerald-500/10"
            : status === "manual"
              ? "bg-blue-500/10"
              : "bg-white/5"
      } ${className}`}
      title={label}
    >
      <span className="text-[10px]">{icon}</span>
      {showLabel && <span>{label}</span>}
    </span>
  );
}

export function FreshnessIndicator({ freshness }: { freshness: PriceFreshnessStatus }) {
  return <PriceFreshnessBadge status={freshness} />;
}
