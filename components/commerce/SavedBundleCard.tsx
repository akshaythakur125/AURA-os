"use client";

import type { SavedWardrobeBundle } from "@/types/wishlist";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/commerce/dealScoring";
import { removeBundle } from "@/lib/commerce/wishlist/savedWardrobeStore";

interface Props {
  bundle: SavedWardrobeBundle;
  onRemove?: () => void;
}

export function SavedBundleCard({ bundle, onRemove }: Props) {
  function handleRemove() {
    removeBundle(bundle.id);
    onRemove?.();
  }

  return (
    <Card className="border-purple-500/20">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-semibold text-white">{bundle.title}</span>
            <Badge variant="premium" className="text-[9px]">{bundle.budgetRange}</Badge>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-gray-500">
            <span>Style: {bundle.styleDirection.replace(/_/g, " ")}</span>
            <span>·</span>
            <span>{bundle.productIds.length} items</span>
          </div>

          <div className="mt-2 flex items-center gap-3">
            <span className="text-sm font-bold text-white">{formatPrice(bundle.currentTotalPrice || bundle.savedTotalPrice)}</span>
            {bundle.currentTotalPrice && bundle.currentTotalPrice !== bundle.savedTotalPrice && (
              <span className="text-xs text-gray-500 line-through">{formatPrice(bundle.savedTotalPrice)}</span>
            )}
          </div>

          <p className="mt-2 text-[10px] text-gray-400">{bundle.expectedAuraShift}</p>
          {bundle.whatToAvoid && (
            <p className="mt-1 text-[10px] text-amber-400/70">Avoid: {bundle.whatToAvoid}</p>
          )}
        </div>

        <div className="flex flex-col items-end gap-2">
          <Button size="sm" variant="ghost" onClick={handleRemove}>Remove</Button>
        </div>
      </div>
    </Card>
  );
}
