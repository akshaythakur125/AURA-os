"use client";

import type { ComparableGroup } from "@/types/commerceSearch";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PriceFreshnessBadge } from "./PriceFreshnessBadge";
import { formatPrice } from "@/lib/commerce/dealScoring";
import { trackStoreClick } from "@/lib/commerce/commerceTracking";
import { comparePricesInGroup } from "@/lib/commerce/search/priceComparisonEngine";

interface Props {
  group: ComparableGroup;
  auditId?: string;
}

export function PriceComparisonCard({ group, auditId }: Props) {
  const comparison = comparePricesInGroup(group);

  if (group.items.length === 0) return null;

  function handleItemClick(item: (typeof group.items)[0]) {
    trackStoreClick(
      item.storeKey,
      item.sourceProductId,
      item.id,
      item.price,
      item.isAffiliate,
      "price_comparison",
      auditId,
      item.category,
      item.isSponsored,
      item.storeName
    );
    window.open(item.affiliateUrl || item.productUrl, "_blank");
  }

  return (
    <Card className="border-emerald-500/10">
      <div className="mb-3">
        <h4 className="text-sm font-semibold text-white">{group.label}</h4>
        <p className="text-[10px] text-gray-500">{group.items.length} options · ₹{comparison.priceRange.min.toLocaleString("en-IN")} – ₹{comparison.priceRange.max.toLocaleString("en-IN")}</p>
      </div>

      {/* Best picks row */}
      <div className="mb-3 grid gap-2 sm:grid-cols-2">
        {/* Cheapest */}
        {comparison.cheapest && (
          <div className="rounded-lg bg-emerald-500/5 border border-emerald-500/10 p-2.5">
            <div className="flex items-center justify-between">
              <Badge variant="success" className="text-[10px]">Cheapest</Badge>
              <span className="text-xs font-bold text-emerald-400">{formatPrice(comparison.cheapest.price)}</span>
            </div>
            <p className="mt-1 text-[10px] text-gray-400">{comparison.cheapest.storeName}</p>
            <div className="mt-1">
              <PriceFreshnessBadge status={comparison.cheapest.priceFreshness} showLabel={false} />
            </div>
            <Button size="sm" className="mt-2 w-full" onClick={() => handleItemClick(comparison.cheapest!)}>
              View
            </Button>
          </div>
        )}

        {/* Best Value */}
        {comparison.bestValue && comparison.bestValue.id !== comparison.cheapest?.id && (
          <div className="rounded-lg bg-purple-500/5 border border-purple-500/10 p-2.5">
            <div className="flex items-center justify-between">
              <Badge variant="premium" className="text-[10px]">Best Value</Badge>
              <span className="text-xs font-bold text-purple-400">{formatPrice(comparison.bestValue.price)}</span>
            </div>
            <p className="mt-1 text-[10px] text-gray-400">{comparison.bestValue.storeName}</p>
            <div className="mt-1">
              <PriceFreshnessBadge status={comparison.bestValue.priceFreshness} showLabel={false} />
            </div>
            <Button size="sm" className="mt-2 w-full" onClick={() => handleItemClick(comparison.bestValue!)}>
              View
            </Button>
          </div>
        )}
      </div>

      {/* Extra picks */}
      <div className="space-y-1.5">
        {comparison.highestDiscount && comparison.highestDiscount.id !== comparison.cheapest?.id && comparison.highestDiscount.id !== comparison.bestValue?.id && (
          <div className="flex items-center justify-between rounded bg-white/5 px-2.5 py-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-gray-400">{comparison.highestDiscount.storeName}</span>
              <span className="text-[10px] text-emerald-400">{comparison.highestDiscountPercent}% off</span>
            </div>
            <span className="text-xs text-white">{formatPrice(comparison.highestDiscount.price)}</span>
          </div>
        )}

        {comparison.trustedStoreOption && comparison.trustedStoreOption.id !== comparison.cheapest?.id && comparison.trustedStoreOption.id !== comparison.bestValue?.id && (
          <div className="flex items-center justify-between rounded bg-white/5 px-2.5 py-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-gray-400">{comparison.trustedStoreOption.storeName}</span>
              <Badge variant="default" className="text-[8px]">Trusted</Badge>
            </div>
            <span className="text-xs text-white">{formatPrice(comparison.trustedStoreOption.price)}</span>
          </div>
        )}

        {comparison.affiliateOption && (
          <div className="flex items-center justify-between rounded bg-white/5 px-2.5 py-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-gray-400">{comparison.affiliateOption.storeName}</span>
              <Badge variant="default" className="text-[8px]">Affiliate</Badge>
            </div>
            <span className="text-xs text-white">{formatPrice(comparison.affiliateOption.price)}</span>
          </div>
        )}
      </div>

      {/* Stale warnings */}
      {comparison.stalePriceWarnings.length > 0 && (
        <div className="mt-3 rounded-lg bg-red-500/5 p-2">
          <p className="text-[10px] text-red-400">
            ⚠ {comparison.stalePriceWarnings.length} option{comparison.stalePriceWarnings.length > 1 ? "s have" : " has"} stale prices — verify on store before buying
          </p>
        </div>
      )}

      {/* All options */}
      <div className="mt-3">
        <details className="group">
          <summary className="cursor-pointer text-[10px] text-gray-500 hover:text-gray-300">
            Show all {group.items.length} options
          </summary>
          <div className="mt-2 space-y-1">
            {comparison.cheapest && (
              <div className="flex items-center justify-between rounded bg-white/5 px-2.5 py-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-gray-400">{comparison.cheapest.storeName}</span>
                  <PriceFreshnessBadge status={comparison.cheapest.priceFreshness} showLabel={false} />
                </div>
                <span className="text-xs text-white">{formatPrice(comparison.cheapest.price)}</span>
              </div>
            )}
            {group.items
              .filter((i) => i.id !== comparison.cheapest?.id)
              .slice(0, 10)
              .map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded bg-white/5 px-2.5 py-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-400">{item.storeName}</span>
                    <PriceFreshnessBadge status={item.priceFreshness} showLabel={false} />
                  </div>
                  <span className="text-xs text-white">{formatPrice(item.price)}</span>
                </div>
              ))}
          </div>
        </details>
      </div>
    </Card>
  );
}
