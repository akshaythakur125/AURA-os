"use client";

import { useEffect, useState } from "react";
import { buildCapsuleChecklist, type Undertone } from "@/lib/style/capsuleChecklist";
import { getOwnedItems, toggleItem } from "@/lib/storage/capsuleProgress";
import { searchLink } from "@/lib/shop/searchLink";
import { trackEvent, EVENTS } from "@/lib/analytics/events";

/**
 * Capsule Checklist — the ~10 wardrobe essentials to own, each in one of the
 * person's colours, as a tickable shopping list they come back to as they buy.
 * Progress persists per audit. Every item is a live search (no fixed image), so
 * the retailer shows the correct current product.
 */
export function CapsuleChecklistCard({
  auditId,
  powerColors,
  undertone,
  gender,
}: {
  auditId: string;
  powerColors?: string[];
  undertone?: Undertone;
  gender?: "men" | "women" | "unisex";
}) {
  const items = buildCapsuleChecklist({ powerColors, undertone, gender });
  const [owned, setOwned] = useState<Set<string>>(new Set());

  useEffect(() => {
    setOwned(getOwnedItems(auditId));
  }, [auditId]);

  const done = items.filter((i) => owned.has(i.id)).length;
  const pct = Math.round((done / items.length) * 100);

  return (
    <div className="rounded-2xl border border-[#1c1917]/[0.08] bg-gradient-to-b from-[#1c1917]/[0.03] to-transparent p-5 sm:p-6">
      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#B23A25]">Capsule Checklist</p>
      <h3 className="mt-0.5 text-base font-bold text-[#1C1917]">10 pieces, in your colours — tick as you buy</h3>
      <p className="mt-1 text-xs text-[#6f675e]">Own these and you can mix a month of outfits. Every piece is set to a colour that suits you, and each links to a live search so you get the real, current product.</p>

      {/* Progress */}
      <div className="mt-4">
        <div className="flex items-center justify-between text-[11px] font-semibold text-[#4a443d]">
          <span>Your capsule</span>
          <span>{done}/{items.length} owned</span>
        </div>
        <div className="mt-1 h-2 overflow-hidden rounded-full bg-[#1c1917]/[0.08]">
          <div className="h-full rounded-full bg-gradient-to-r from-[#E14434] to-[#c0341f] transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* Items */}
      <div className="mt-4 space-y-2">
        {items.map((it) => {
          const isOwned = owned.has(it.id);
          return (
            <div key={it.id} className={`flex items-start gap-3 rounded-xl border p-3 transition-colors ${isOwned ? "border-emerald-500/25 bg-emerald-500/[0.05]" : "border-[#1c1917]/[0.06] bg-white/50"}`}>
              <button
                onClick={() => setOwned(toggleItem(auditId, it.id))}
                aria-label={isOwned ? "Mark as not owned" : "Mark as owned"}
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border text-[11px] transition-colors ${isOwned ? "border-emerald-500 bg-emerald-500 text-white" : "border-[#1c1917]/25 text-transparent hover:border-[#E14434]/50"}`}
              >
                ✓
              </button>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <p className={`text-xs font-semibold ${isOwned ? "text-[#857b6e] line-through" : "text-[#1C1917]"}`}>
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-[#B23A25]">{it.slot} · </span>{it.item}
                  </p>
                </div>
                <p className="mt-0.5 text-[11px] text-[#4a443d]">{it.why}</p>
                {!isOwned && (
                  <div className="mt-1 flex gap-2">
                    <a href={searchLink(it.query, "amazon")} target="_blank" rel="noopener noreferrer sponsored" onClick={() => trackEvent(EVENTS.SHOP_LINK_CLICKED, { retailer: "amazon", lookCategory: "capsule" })} className="text-[11px] font-semibold text-[#B23A25] hover:underline">Amazon →</a>
                    <a href={searchLink(it.query, "flipkart")} target="_blank" rel="noopener noreferrer sponsored" onClick={() => trackEvent(EVENTS.SHOP_LINK_CLICKED, { retailer: "flipkart", lookCategory: "capsule" })} className="text-[11px] font-semibold text-[#857b6e] hover:underline">Flipkart →</a>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {done === items.length && (
        <p className="mt-3 rounded-lg border border-emerald-500/25 bg-emerald-500/[0.06] p-2.5 text-xs font-semibold text-emerald-700">🎉 Capsule complete — you can now dress well on autopilot.</p>
      )}
    </div>
  );
}
