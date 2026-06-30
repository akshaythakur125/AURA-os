"use client";

import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { CATEGORY_LABELS, CATEGORY_GRADIENTS, type ProductCategory } from "@/types/product";
import type { RecommendedProduct } from "@/types/product";
import { recordAffiliateClick } from "@/lib/storage/affiliateStore";

function getCategoryGradient(category: string): string {
  return CATEGORY_GRADIENTS[category as ProductCategory] || "from-gray-600 to-slate-500";
}

export function ProductCard({
  recommendation,
  auditId,
  source = "audit",
}: {
  recommendation: RecommendedProduct;
  auditId?: string;
  source?: string;
}) {
  const { product, reason, priority } = recommendation;
  const gradient = getCategoryGradient(product.category);

  function handleClick() {
    if (product.affiliateUrl && product.affiliateUrl !== "#") {
      recordAffiliateClick({
        productId: product.id,
        auditId,
        source,
      });
      window.open(product.affiliateUrl, "_blank", "noopener,noreferrer");
    }
  }

  const priorityColors: Record<string, string> = {
    high: "text-emerald-400",
    medium: "text-amber-400",
    low: "text-gray-500",
  };

  return (
    <Card className="flex flex-col overflow-hidden p-0">
      <div className={`bg-gradient-to-br ${gradient} flex items-center justify-center p-6`}>
        <div className="text-center">
          <div className="text-2xl font-bold text-white/80">{product.price === 0 ? "FREE" : product.priceLabel}</div>
          <div className="mt-1 text-xs text-white/50">{CATEGORY_LABELS[product.category] || product.category}</div>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-semibold text-white">{product.title}</h3>
          <Badge variant={priority === "high" ? "success" : priority === "medium" ? "warning" : "default"}>
            {priority}
          </Badge>
        </div>

        <p className="text-xs text-gray-400">{product.description}</p>

        <div className="rounded-lg bg-white/5 p-3">
          <div className="mb-1 text-xs text-purple-400">Why it works</div>
          <p className="text-xs text-gray-300">{product.whyItWorks}</p>
        </div>

        <div className="text-xs">
          <span className="text-gray-500">Improves: </span>
          <span className="text-gray-300">{product.visualSignalImproved}</span>
        </div>

        {reason && (
          <div className="text-xs">
            <span className="text-gray-500">Why for you: </span>
            <span className="text-purple-300">{reason}</span>
          </div>
        )}

        <div className="mt-auto flex items-center justify-between pt-2">
          <span className={`text-[10px] ${priorityColors[priority] || "text-gray-500"}`}>
            Match: {recommendation.matchScore}%
          </span>
          {product.affiliateUrl && product.affiliateUrl !== "#" ? (
            <button
              onClick={handleClick}
              className="rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-purple-500"
            >
              View Upgrade
            </button>
          ) : (
            <span className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-gray-500">
              Coming soon
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}
