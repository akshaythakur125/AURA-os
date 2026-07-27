"use client";

import { useEffect, useState } from "react";
import { trackEvent, EVENTS } from "@/lib/analytics/events";
import { ProductThumb } from "./ProductThumb";
import { fetchLiveProducts, type LiveProduct } from "@/lib/shop/liveFeed";

export interface AffiliateItem {
  label: string;
  why: string;
  priceHint?: string;
  /** Emoji shown as the always-visible product thumbnail. */
  emoji: string;
  /** Search query for the live feed — enables a real product photo/price/link when a feed is configured. */
  query?: string;
  /** Ordered retailer options, cheapest/primary first. */
  links: { label: string; url: string; retailer: string; category: string }[];
}

function AffiliateRow({ item }: { item: AffiliateItem }) {
  const [live, setLive] = useState<LiveProduct | null>(null);

  useEffect(() => {
    if (!item.query) return;
    let cancelled = false;
    fetchLiveProducts(item.query).then((ps) => {
      if (!cancelled && ps.length > 0) setLive(ps[0]);
    });
    return () => { cancelled = true; };
  }, [item.query]);

  const cat = item.links[0]?.category || "shop";

  return (
    <div className="flex gap-3 rounded-xl border border-[#1c1917]/[0.07] bg-[#fbf8f2]/70 p-3">
      <ProductThumb imageUrl={live?.image} emoji={item.emoji} label={item.label} className="h-16 w-16" />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-[#1C1917]">{item.label}</span>
          {live ? (
            <span className="rounded-full bg-[#E14434]/10 px-2 py-0.5 text-[10px] font-semibold text-[#B23A25]">₹{live.price.toLocaleString("en-IN")} · live</span>
          ) : item.priceHint ? (
            <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">{item.priceHint}</span>
          ) : null}
        </div>
        <p className="mt-0.5 text-[11px] leading-snug text-[#6f675e]">{item.why}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {live && (
            <a
              href={live.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent(EVENTS.SHOP_LINK_CLICKED, { retailer: live.retailer, lookCategory: cat })}
              className="rounded-lg bg-[#1C1917] px-2.5 py-1.5 text-[11px] font-semibold text-white transition-opacity hover:opacity-90"
            >
              Buy this →
            </a>
          )}
          {item.links.map((l) => (
            <a
              key={l.retailer}
              href={l.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent(EVENTS.SHOP_LINK_CLICKED, { retailer: l.retailer, lookCategory: l.category })}
              className={live
                ? "rounded-lg border border-[#1c1917]/15 px-2.5 py-1.5 text-[11px] font-medium text-[#4a443d] transition-colors hover:bg-[#1c1917]/[0.04]"
                : "rounded-lg bg-[#1C1917] px-2.5 py-1.5 text-[11px] font-semibold text-white transition-opacity hover:opacity-90"}
            >
              {l.label} →
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Renders measured-need → product picks with affiliate links. Each row shows a
 * real product photo/price/link when a live feed is configured, otherwise the
 * emoji thumbnail + retailer search links. Shared by the photo-kit and grooming
 * cards.
 */
export function AffiliateItemList({ items }: { items: AffiliateItem[] }) {
  return (
    <div className="space-y-2.5">
      {items.map((it, i) => (
        <AffiliateRow key={it.label + i} item={it} />
      ))}
    </div>
  );
}
