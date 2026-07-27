"use client";

import { trackEvent, EVENTS } from "@/lib/analytics/events";
import { ProductThumb } from "./ProductThumb";

export interface AffiliateItem {
  label: string;
  why: string;
  priceHint?: string;
  /** Emoji shown as the always-visible product thumbnail. */
  emoji: string;
  /** Ordered retailer options, cheapest/primary first. */
  links: { label: string; url: string; retailer: string; category: string }[];
}

/**
 * Presentational list of measured-need → product picks with affiliate links.
 * Shared by the photo-kit and grooming cards. Every link is already
 * affiliate-wrapped upstream; this just renders + tracks the click.
 */
export function AffiliateItemList({ items }: { items: AffiliateItem[] }) {
  return (
    <div className="space-y-2.5">
      {items.map((it, i) => (
        <div key={it.label + i} className="flex gap-3 rounded-xl border border-[#1c1917]/[0.07] bg-[#fbf8f2]/70 p-3">
          <ProductThumb emoji={it.emoji} label={it.label} className="h-16 w-16" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-[#1C1917]">{it.label}</span>
              {it.priceHint && (
                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">{it.priceHint}</span>
              )}
            </div>
            <p className="mt-0.5 text-[11px] leading-snug text-[#6f675e]">{it.why}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {it.links.map((l) => (
                <a
                  key={l.retailer}
                  href={l.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackEvent(EVENTS.SHOP_LINK_CLICKED, { retailer: l.retailer, lookCategory: l.category })}
                  className="rounded-lg bg-[#1C1917] px-2.5 py-1.5 text-[11px] font-semibold text-white transition-opacity hover:opacity-90"
                >
                  {l.label} →
                </a>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
