"use client";

import { Card } from "@/components/ui/Card";
import { ProductCard } from "@/components/products/ProductCard";
import { UpgradeBundleCard } from "@/components/products/UpgradeBundleCard";
import type { Audit } from "@/types";
import type { RecommendedProduct, UpgradeBundle } from "@/types/product";
import { getRecommendationsForAudit } from "@/lib/recommendations/getRecommendations";
import { buildUpgradeBundle } from "@/lib/recommendations/buildUpgradeBundle";

export function RecommendationSection({ audit }: { audit: Audit }) {
  if (audit.reportStatus === "draft") {
    return (
      <Card className="mb-8">
        <div className="py-6 text-center">
          <h3 className="mb-2 text-sm font-semibold text-white">Upgrade Recommendations</h3>
          <p className="text-sm text-gray-400">
            Generate your free Aura Score to get personalized upgrade recommendations.
          </p>
        </div>
      </Card>
    );
  }

  const recommendations: RecommendedProduct[] = getRecommendationsForAudit(audit, { limit: 8 });
  let bundle: UpgradeBundle | null = null;

  try {
    bundle = buildUpgradeBundle(audit);
  } catch {
    bundle = null;
  }

  const isFullReport = audit.reportStatus === "full_report";
  const displayRecs = isFullReport ? recommendations.slice(0, 8) : recommendations.slice(0, 6);

  return (
    <div className="mb-8 space-y-6">
      <h2 className="text-lg font-semibold text-white">
        {isFullReport
          ? "Your Premium Upgrade Path"
          : "Recommended Upgrades for Your Biggest Status Leaks"}
      </h2>

      {bundle && (
        <UpgradeBundleCard bundle={bundle} auditId={audit.id} />
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {displayRecs.map((rec) => (
          <ProductCard
            key={rec.product.id}
            recommendation={rec}
            auditId={audit.id}
            source="audit"
          />
        ))}
      </div>

      {displayRecs.length === 0 && (
        <Card>
          <div className="py-6 text-center text-sm text-gray-500">
            No product recommendations match your current budget. Try free actions below.
          </div>
        </Card>
      )}

      <div className="space-y-2 rounded-xl border border-white/5 bg-white/[0.02] p-4 text-xs text-gray-600">
        <p>Recommendations are presentation guidance only. AuraCheck does not guarantee social, dating, career, or financial outcomes.</p>
        <p>Prices and links are placeholders in this local MVP. Verify details before buying.</p>
      </div>
    </div>
  );
}
