"use client";

import { buildFragranceGuide } from "@/lib/grooming/fragranceFinder";
import { searchLink } from "@/lib/shop/searchLink";
import { trackEvent, EVENTS } from "@/lib/analytics/events";

/**
 * Fragrance Finder — the person's scent family turned into a budget-tiered
 * buying guide: the notes to look for and live searches at each price. No fixed
 * product image is ever shown, so nothing can drift out of sync with a label —
 * the retailer renders the real, current product itself.
 */
export function FragranceFinderCard({ scentFamilies, gender, budget }: { scentFamilies?: string[]; gender?: string; budget?: number }) {
  const guide = buildFragranceGuide({ families: scentFamilies, gender, budget });

  return (
    <div className="rounded-2xl border border-[#1c1917]/[0.08] bg-gradient-to-b from-[#1c1917]/[0.03] to-transparent p-5 sm:p-6">
      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#B23A25]">Fragrance Finder</p>
      <h3 className="mt-0.5 text-base font-bold text-[#1C1917]">Your scent — {guide.label}</h3>
      <p className="mt-1 text-xs text-[#6f675e]">Matched to your vibe. Here&apos;s exactly what to look for and where to find it at every budget.</p>

      {/* Notes to look for */}
      <div className="mt-4">
        <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#857b6e]">Look for these notes on the bottle</p>
        <div className="flex flex-wrap gap-1.5">
          {guide.lookFor.map((nt) => (
            <span key={nt} className="rounded-full border border-[#E14434]/30 bg-[#E14434]/[0.05] px-2.5 py-1 text-[11px] capitalize text-[#B23A25]">{nt}</span>
          ))}
        </div>
      </div>

      {/* Budget tiers */}
      <div className="mt-4 space-y-2.5">
        {guide.picks.map((p) => (
          <div key={p.tier} className="rounded-xl border border-[#1c1917]/[0.06] bg-white/50 p-3.5">
            <div className="flex items-start justify-between gap-2">
              <p className="text-xs font-bold text-[#1C1917]">{p.tier}</p>
              <span className="shrink-0 text-[10px] font-semibold text-[#857b6e]">{p.priceHint}</span>
            </div>
            <p className="mt-0.5 text-[11px] text-[#4a443d]">{p.note}</p>
            <div className="mt-1.5 flex gap-2">
              <a href={searchLink(p.query, "nykaa")} target="_blank" rel="noopener noreferrer sponsored" onClick={() => trackEvent(EVENTS.SHOP_LINK_CLICKED, { retailer: "nykaa", lookCategory: "fragrance" })} className="text-[11px] font-semibold text-[#B23A25] hover:underline">Nykaa →</a>
              <a href={searchLink(p.query, "amazon")} target="_blank" rel="noopener noreferrer sponsored" onClick={() => trackEvent(EVENTS.SHOP_LINK_CLICKED, { retailer: "amazon", lookCategory: "fragrance" })} className="text-[11px] font-semibold text-[#857b6e] hover:underline">Amazon →</a>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 space-y-1.5">
        <p className="text-[11px] text-[#4a443d]"><span className="font-semibold text-[#1C1917]">How to wear it: </span>{guide.applyTip}</p>
        <p className="text-[11px] text-[#857b6e]"><span className="font-semibold text-[#1C1917]">Before you buy: </span>{guide.buyTip}</p>
      </div>
    </div>
  );
}
