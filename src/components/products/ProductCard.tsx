"use client";

import { Button } from "@/components/ui/Button";
import { recordAffiliateClick } from "@/lib/storage/affiliateStore";
import { CATEGORY_LABELS, CATEGORY_COLORS } from "@/types/product";
import type { Product, RecommendedProduct } from "@/types/product";

interface Props {
  product: Product;
  recommendation?: RecommendedProduct;
  auditId?: string;
  source?: string;
}

const colorMap: Record<string, string> = {
  emerald: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  blue: "border-blue-500/30 bg-blue-500/10 text-blue-300",
  purple: "border-purple-500/30 bg-purple-500/10 text-purple-300",
  amber: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  pink: "border-pink-500/30 bg-pink-500/10 text-pink-300",
  cyan: "border-cyan-500/30 bg-cyan-500/10 text-cyan-300",
  orange: "border-orange-500/30 bg-orange-500/10 text-orange-300",
  slate: "border-slate-500/30 bg-slate-500/10 text-slate-300",
  violet: "border-violet-500/30 bg-violet-500/10 text-violet-300",
  rose: "border-rose-500/30 bg-rose-500/10 text-rose-300",
  indigo: "border-indigo-500/30 bg-indigo-500/10 text-indigo-300",
};

export function ProductCard({ product, recommendation, auditId, source = "audit" }: Props) {
  const color = CATEGORY_COLORS[product.category] || "purple";
  const catLabel = CATEGORY_LABELS[product.category] || product.category;

  function handleClick() {
    try {
      recordAffiliateClick({ productId: product.id, auditId, source });
    } catch { /* storage unavailable */ }
  }

  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 transition-colors hover:border-white/10">
      {/* Category + Sponsored */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${colorMap[color] || colorMap.purple}`}>
          {catLabel}
        </span>
        {product.isSponsored && (
          <span className="text-[10px] text-amber-500">Sponsored</span>
        )}
      </div>

      {/* Title + Price */}
      <div className="mb-2 flex items-start justify-between gap-2">
        <h4 className="text-sm font-semibold text-white">{product.title}</h4>
        <span className="shrink-0 text-sm font-medium text-amber-400">{product.priceLabel}</span>
      </div>

      <p className="mb-3 text-xs text-gray-500">{product.description}</p>

      {recommendation && (
        <div className="mb-3 space-y-1 rounded-lg border border-purple-500/10 bg-purple-500/5 p-2.5">
          <p className="text-xs text-purple-300">{recommendation.reason}</p>
          <p className="text-[11px] text-gray-500">{recommendation.estimatedImpact}</p>
          {recommendation.matchScore > 0 && (
            <div className="flex items-center gap-2">
              <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/5">
                <div
                  className="h-full rounded-full bg-purple-500"
                  style={{ width: `${recommendation.matchScore}%` }}
                />
              </div>
              <span className="text-[10px] text-gray-500">{recommendation.matchScore}%</span>
            </div>
          )}
        </div>
      )}

      <p className="mb-3 text-xs text-gray-500">
        <span className="text-purple-300">Why it works:</span> {product.whyItWorks}
      </p>

      {/* CTA */}
      {product.affiliateUrl && product.affiliateUrl !== "#" ? (
        <a
          href={product.affiliateUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleClick}
        >
          <Button size="sm" className="w-full">View Upgrade</Button>
        </a>
      ) : (
        <span className="block rounded-lg border border-white/5 px-3 py-2 text-center text-xs text-gray-500">
          Coming soon
        </span>
      )}
    </div>
  );
}
