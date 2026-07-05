"use client";

import type { CommerceSearchResult } from "@/types/commerceSearch";
import { Card } from "@/components/ui/Card";
import { trackStoreClick } from "@/lib/commerce/commerceTracking";
import { formatPrice } from "@/lib/commerce/dealScoring";
import { getCommerceItemExternalUrl } from "@/lib/utils/externalLinks";
import { ProductThumb } from "./ProductThumb";

interface Props {
  result: CommerceSearchResult;
  rankPosition: number;
  auditId?: string;
}

export function SearchResultCard({ result, rankPosition, auditId }: Props) {
  const { item, dealLabel } = result;
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
      <div className="flex items-start gap-4">
        <ProductThumb
          imageUrl={item.imageUrl}
          category={item.category}
          title={item.originalTitle}
          colorTag={item.colorTags[0]}
          size="md"
        />

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white leading-tight">{item.originalTitle}</h3>
          <div className="mt-1 flex items-center gap-2 text-xs text-gray-400">
            <span>{item.storeName}</span>
            {item.brand && <><span className="text-white/20">·</span><span>{item.brand}</span></>}
            <span className="text-white/20">·</span>
            <span>{item.category.replace(/_/g, " ")}</span>
          </div>

          <div className="mt-3 flex items-baseline gap-2">
            {item.mrp && item.mrp > item.price && (
              <span className="text-xs text-gray-500 line-through">₹{item.mrp.toLocaleString("en-IN")}</span>
            )}
            <span className="text-xl font-bold text-white">{formatPrice(item.price)}</span>
            {item.discountPercent && item.discountPercent >= 10 && (
              <span className="text-xs font-medium text-emerald-400">{item.discountPercent}% off</span>
            )}
          </div>

          {dealLabel && (
            <div className="mt-1">
              <span className="text-[10px] font-medium text-emerald-400">{dealLabel}</span>
            </div>
          )}

          <div className="mt-3">
            <a
              href={externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleClick}
              className="inline-flex min-h-9 items-center justify-center rounded-full border border-white/15 bg-[linear-gradient(135deg,rgba(125,211,252,0.95),rgba(59,130,246,0.92)_45%,rgba(249,115,22,0.84))] px-5 text-sm font-semibold tracking-[-0.02em] text-slate-950 shadow-[0_18px_48px_rgba(56,189,248,0.22)] hover:-translate-y-0.5 hover:shadow-[0_24px_60px_rgba(249,115,22,0.22)]"
            >
              View on {item.storeName}
            </a>
          </div>
        </div>
      </div>
    </Card>
  );
}
