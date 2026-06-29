"use client";

import { useState } from "react";
import { ProductCard } from "./ProductCard";
import { UpgradeBundleCard } from "./UpgradeBundleCard";
import { getRecommendationsForAudit } from "@/lib/recommendations/getRecommendations";
import { buildUpgradeBundle } from "@/lib/recommendations/buildUpgradeBundle";
import type { Audit } from "@/types/audit";

interface Props {
  audit: Audit;
  isPremium?: boolean;
}

export function RecommendationSection({ audit, isPremium }: Props) {
  const [showAll, setShowAll] = useState(false);

  const products = getRecommendationsForAudit(audit, { limit: showAll ? 12 : 4 });
  const bundle = buildUpgradeBundle(audit);

  if (products.length === 0) return null;

  return (
    <div className="space-y-6">
      <UpgradeBundleCard bundle={bundle} budget={audit.budgetRange} />

      <div>
        <h3 className="mb-4 text-sm font-semibold text-white">
          {isPremium ? "Your Premium Upgrade Path" : "Recommended Upgrades"}
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          {products.slice(0, showAll ? 12 : 4).map((r) => (
            <ProductCard
              key={r.product.id}
              product={r.product}
              recommendation={r}
              auditId={audit.id}
              source="audit"
            />
          ))}
        </div>
        {products.length > 4 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="mt-4 w-full rounded-lg border border-white/5 px-4 py-2 text-xs text-gray-400 transition-colors hover:border-white/10"
          >
            {showAll ? "Show Less" : `Show All ${products.length} Recommendations`}
          </button>
        )}
      </div>
    </div>
  );
}
