"use client";

import type { WardrobeGap } from "@/types/visualWardrobe";
import { Badge } from "@/components/ui/Badge";

interface Props {
  gap: WardrobeGap;
}

const SEVERITY_STYLES: Record<string, "success" | "warning" | "danger"> = {
  low: "success",
  medium: "warning",
  high: "danger",
};

export function WardrobeGapCard({ gap }: Props) {
  return (
    <div className="rounded-lg border border-white/5 bg-white/[0.02] p-2.5">
      <div className="flex items-start justify-between mb-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-white">{gap.type.replace(/_/g, " ")}</span>
          <Badge variant={SEVERITY_STYLES[gap.severity] || "default"} className="text-[9px]">
            {gap.severity}
          </Badge>
        </div>
        <span className="text-[10px] text-purple-400">Impact: {gap.auraImpactScore}</span>
      </div>
      <p className="text-[10px] text-gray-400 mb-1">{gap.explanation}</p>
      <p className="text-[10px] text-emerald-400/80">{gap.fix}</p>
      <div className="mt-1 flex gap-2 text-[9px] text-gray-500">
        <span>Category: {gap.recommendedCategory}</span>
        <span>Color: {gap.recommendedColorFamily}</span>
      </div>
    </div>
  );
}
