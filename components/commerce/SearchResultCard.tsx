"use client";

import type { CommerceSearchResult } from "@/types/commerceSearch";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { PriceFreshnessBadge } from "./PriceFreshnessBadge";
import { trackStoreClick } from "@/lib/commerce/commerceTracking";
import { formatPrice } from "@/lib/commerce/dealScoring";
import { getCommerceItemExternalUrl } from "@/lib/utils/externalLinks";

interface Props {
  result: CommerceSearchResult;
  rankPosition: number;
  auditId?: string;
}

export function SearchResultCard({ result, rankPosition, auditId }: Props) {
  const { item, reason, finalRankScore, linkedAuraLeak, stylingTip, priceWarning, dealLabel } = result;
  const externalUrl = getCommerceItemExternalUrl({
    affiliateUrl: item.affiliateUrl,
    productUrl: item.productUrl,
    originalTitle: item.originalTitle,
    storeKey: item.storeKey,
  });

  function handleClick() {
    trackStoreClick(
      item.storeKey,
      item.sourceProductId,
      item.id,
      item.price,
      item.isAffiliate,
      "commerce_search",
      auditId,
      item.category,
      item.isSponsored,
      item.storeName
    );
  }

  return (
    <Card className="group transition-colors hover:border-purple-500/30">
      <div className="flex flex-wrap items-start justify-between gap-4">
        {/* Product Info */}
        <div className="flex-1 min-w-0">
          <div className="mb-1 flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-white">{item.originalTitle}</span>
            <span className="text-[10px] text-gray-500">{item.category.replace(/_/g, " ")}</span>
            {item.isSponsored && <Badge variant="default" className="text-[10px]">Sponsored</Badge>}
            {item.isAffiliate && <Badge variant="default" className="text-[10px]">Affiliate</Badge>}
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span>at {item.storeName}</span>
            {item.brand && <span>· {item.brand}</span>}
          </div>

          {/* Reason */}
          <p className="mt-2 text-xs text-gray-500">{reason}</p>

          {/* Styling Tip */}
          {stylingTip && (
            <p className="mt-1 text-[10px] text-purple-300/60">{stylingTip}</p>
          )}

          {/* Tags */}
          <div className="mt-2 flex flex-wrap gap-1">
            {item.colorTags.slice(0, 3).map((tag) => (
              <span key={tag} className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-gray-400">
                {tag}
              </span>
            ))}
            {linkedAuraLeak && (
              <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] text-amber-400">
                Fixes: {linkedAuraLeak.replace(/_/g, " ")}
              </span>
            )}
          </div>

          {/* Freshness & Warnings */}
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <PriceFreshnessBadge status={item.priceFreshness} />
            {priceWarning && (
              <span className="text-[10px] text-amber-400">{priceWarning}</span>
            )}
          </div>

          {/* Deal Label */}
          {dealLabel && (
            <div className="mt-2">
              <span className="text-[10px] font-medium text-emerald-400">{dealLabel}</span>
            </div>
          )}
        </div>

        {/* Price & Action */}
        <div className="flex flex-col items-end gap-2">
          {/* Score */}
          <div className="text-right">
            <div className="text-xs text-gray-500">Rank #{rankPosition}</div>
            <div className="h-1 w-20 rounded-full bg-white/10 overflow-hidden mt-0.5">
              <div
                className="h-full rounded-full bg-purple-500 transition-all"
                style={{ width: `${Math.round(finalRankScore * 100)}%` }}
              />
            </div>
          </div>

          {/* Price */}
          <div className="text-right">
            {item.mrp && item.mrp > item.price && (
              <div className="text-xs text-gray-500 line-through">₹{item.mrp.toLocaleString("en-IN")}</div>
            )}
            <div className="text-2xl font-bold text-white">{formatPrice(item.price)}</div>
            {item.discountPercent && item.discountPercent >= 1 && (
              <div className="text-xs text-emerald-400">{item.discountPercent}% off</div>
            )}
          </div>

          <a
            href={externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleClick}
            className="inline-flex min-h-10 items-center justify-center rounded-full border border-white/15 bg-[linear-gradient(135deg,rgba(125,211,252,0.95),rgba(59,130,246,0.92)_45%,rgba(249,115,22,0.84))] px-4 text-sm font-semibold tracking-[-0.02em] text-slate-950 shadow-[0_18px_48px_rgba(56,189,248,0.22)] hover:-translate-y-0.5 hover:shadow-[0_24px_60px_rgba(249,115,22,0.22)]"
          >
            {item.affiliateUrl ? "View via Affiliate" : `View on ${item.storeName}`}
          </a>
        </div>
      </div>
    </Card>
  );
}
