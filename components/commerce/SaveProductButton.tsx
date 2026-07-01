"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { addWishlistItem, removeWishlistItem, updateWishlistItem, isProductSaved, getWishlistItems } from "@/lib/commerce/wishlist/wishlistStore";

interface Props {
  productId: string;
  offerId?: string;
  storeKey?: string;
  auditId?: string;
  productTitle: string;
  category: string;
  styleDirection?: string;
  linkedAuraLeak?: string;
  savedPrice: number;
  affiliateUsed?: boolean;
  source: string;
  showTargetPrice?: boolean;
  size?: "sm" | "md";
}

export function SaveProductButton({
  productId, offerId, storeKey, auditId, productTitle, category,
  styleDirection, linkedAuraLeak, savedPrice, affiliateUsed, source,
  showTargetPrice, size = "sm",
}: Props) {
  const [saved, setSaved] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [showTarget, setShowTarget] = useState(false);
  const [targetPrice, setTargetPrice] = useState("");

  useEffect(() => {
    Promise.resolve().then(() => {
      setSaved(isProductSaved(productId, storeKey));
      const items = getWishlistItems();
      const existing = items.find((i) => i.productId === productId && i.storeKey === storeKey);
      if (existing) {
        setSavedId(existing.id);
        if (existing.targetPrice) setTargetPrice(String(existing.targetPrice));
      }
    });
  }, [productId, storeKey]);

  function handleSave() {
    if (saved && savedId) {
      removeWishlistItem(savedId);
      setSaved(false);
      setSavedId(null);
      return;
    }

    const id = `wl_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    addWishlistItem({
      id,
      productId,
      offerId,
      storeKey,
      auditId,
      productTitle,
      category,
      styleDirection,
      linkedAuraLeak,
      savedPrice,
      targetPrice: targetPrice ? parseInt(targetPrice, 10) : undefined,
      affiliateUsed,
      source,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    setSaved(true);
    setSavedId(id);
  }

  function handleSetTarget() {
    if (savedId && targetPrice) {
      updateWishlistItem(savedId, { targetPrice: parseInt(targetPrice, 10) });
    }
    setShowTarget(false);
  }

  return (
    <div className="inline-flex items-center gap-2">
      <Button
        size={size}
        variant={saved ? "primary" : "outline"}
        onClick={handleSave}
        className={saved ? "bg-emerald-600 hover:bg-emerald-700" : ""}
      >
        {saved ? "Saved" : "Save"}
      </Button>
      {saved && showTargetPrice && !showTarget && (
        <button
          onClick={() => setShowTarget(true)}
          className="text-[10px] text-gray-500 hover:text-purple-300 underline"
        >
          Set alert price
        </button>
      )}
      {saved && showTargetPrice && showTarget && (
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-gray-500">Alert if below ₹</span>
          <input
            type="number"
            value={targetPrice}
            onChange={(e) => setTargetPrice(e.target.value)}
            className="w-20 rounded border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-white"
            placeholder="Amount"
          />
          <button onClick={handleSetTarget} className="text-[10px] text-purple-400 hover:underline">Set</button>
        </div>
      )}
    </div>
  );
}
