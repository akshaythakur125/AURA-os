"use client";

import type { WishlistItem } from "@/types/wishlist";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { PriceFreshnessBadge } from "./PriceFreshnessBadge";
import { PriceDropBadge, PriceUpBadge } from "./PriceDropBadge";
import { BestTimeToBuyBadge } from "./BestTimeToBuyBadge";
import { evaluateBestTimeToBuy } from "@/lib/commerce/deals/bestTimeToBuy";
import { formatPrice } from "@/lib/commerce/dealScoring";
import { removeWishlistItem } from "@/lib/commerce/wishlist/wishlistStore";

interface Props {
  item: WishlistItem;
  catalogItem?: { price: number; priceFreshness: string; discountPercent?: number; mrp?: number };
  onRemove?: () => void;
}

export function SavedWardrobeCard({ item, catalogItem, onRemove }: Props) {
  const timing = evaluateBestTimeToBuy(item, catalogItem);

  const priceDiff = item.currentPrice !== undefined ? item.savedPrice - item.currentPrice : 0;
  const priceDiffPercent = item.savedPrice > 0 ? Math.round((Math.abs(priceDiff) / item.savedPrice) * 100) : 0;

  function handleRemove() {
    removeWishlistItem(item.id);
    onRemove?.();
  }

  function handleViewStore() {
    window.open(`/api/out?url=${encodeURIComponent(item.productId)}`, "_blank");
  }

  return (
    <Card>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-white text-sm">{item.productTitle}</span>
            {item.category && <span className="text-[10px] text-gray-500">{item.category}</span>}
          </div>

          <div className="mt-1 flex items-center gap-3 text-xs text-gray-500">
            {item.storeKey && <span>{item.storeKey.replace(/_/g, " ")}</span>}
            {item.linkedAuraLeak && (
              <Badge variant="default" className="text-[9px]">{item.linkedAuraLeak.replace(/_/g, " ")}</Badge>
            )}
          </div>

          {/* Price info */}
          <div className="mt-2 flex items-center gap-3">
            <span className="text-sm font-bold text-white">{formatPrice(item.currentPrice || item.savedPrice)}</span>
            {item.currentPrice !== undefined && item.currentPrice !== item.savedPrice && (
              <span className="text-xs text-gray-500 line-through">{formatPrice(item.savedPrice)}</span>
            )}
            {priceDiff > 0 && <PriceDropBadge dropAmount={priceDiff} dropPercent={priceDiffPercent} />}
            {priceDiff < 0 && <PriceUpBadge amount={Math.abs(priceDiff)} percent={priceDiffPercent} />}
          </div>

          {/* Freshness & Timing */}
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {item.priceFreshness && <PriceFreshnessBadge status={item.priceFreshness as "fresh" | "recent" | "stale" | "manual" | "unknown"} />}
            <BestTimeToBuyBadge timing={timing.timing} label={timing.label} />
          </div>

          {/* Target price */}
          {item.targetPrice && (
            <div className="mt-1 text-[10px] text-gray-500">
              Target: ₹{item.targetPrice}
              {item.currentPrice !== undefined && item.currentPrice <= item.targetPrice && (
                <span className="ml-1 text-emerald-400">✓ Target reached</span>
              )}
            </div>
          )}

          {item.source && (
            <div className="mt-1 text-[9px] text-gray-600">Saved from: {item.source}</div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col items-end gap-2">
          <div className="text-[10px] text-gray-500">{new Date(item.createdAt).toLocaleDateString("en-IN")}</div>
          <Button size="sm" onClick={handleViewStore}>View on Store</Button>
          <Button size="sm" variant="ghost" onClick={handleRemove}>Remove</Button>
        </div>
      </div>
    </Card>
  );
}
