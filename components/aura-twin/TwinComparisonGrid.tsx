"use client";

import type { AuraTwinVariant } from "@/types/auraTwin";
import { TwinVariantCard } from "@/components/aura-twin/TwinVariantCard";

interface TwinComparisonGridProps {
  variants: AuraTwinVariant[];
  bestVariantId: string;
  rankedIds: string[];
}

export function TwinComparisonGrid({ variants, bestVariantId, rankedIds }: TwinComparisonGridProps) {
  const sorted = rankedIds
    .map((id) => variants.find((v) => v.id === id))
    .filter((v): v is AuraTwinVariant => !!v);

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {sorted.map((variant) => (
        <TwinVariantCard
          key={variant.id}
          variant={variant}
          isBest={variant.id === bestVariantId}
        />
      ))}
    </div>
  );
}
