"use client";

import { useMemo, useState } from "react";
import { buildOccasionKit, OCCASIONS, type Occasion, type OccasionTraits } from "@/lib/style/occasionKit";
import { searchLink } from "@/lib/shop/searchLink";
import { trackEvent, EVENTS } from "@/lib/analytics/events";

// The 2–3 garments to actually buy for each occasion, built from the person's
// lead colour + gender so the search lands on shoppable results, not a category.
function shopQueries(occasion: Occasion, color: string, gender?: string): { label: string; query: string }[] {
  const g = gender === "men" ? " men" : gender === "women" ? " women" : "";
  const c = color || "navy";
  switch (occasion) {
    case "first-date": return [{ label: `${c} shirt`, query: `${c} slim fit shirt${g}` }, { label: "dark denim", query: `dark wash jeans${g}` }, { label: "white sneakers", query: `white sneakers${g}` }];
    case "interview": return [{ label: "formal shirt", query: `light formal shirt${g}` }, { label: "formal trousers", query: `charcoal formal trousers${g}` }, { label: "formal shoes", query: `formal leather shoes${g}` }];
    case "headshot": return [{ label: `${c} top`, query: `${c} solid shirt${g}` }];
    case "wedding": return gender === "women" ? [{ label: `${c} ethnic`, query: `${c} ethnic wear women` }] : [{ label: `${c} kurta`, query: `${c} kurta men` }];
    case "festival": return [{ label: `${c} ethnic`, query: `${c} ethnic${g}` }];
    case "night-out": return [{ label: "dark shirt", query: `black slim fit shirt${g}` }, { label: `${c} accent`, query: `${c} shirt${g}` }];
    case "college":
    default: return [{ label: `${c} tee`, query: `${c} t-shirt${g}` }, { label: "denim", query: `slim jeans${g}` }, { label: "sneakers", query: `casual sneakers${g}` }];
  }
}

function Chips({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((i) => (
        <span key={i} className="rounded-full border border-[#E14434]/30 bg-[#E14434]/[0.05] px-2.5 py-1 text-[11px] capitalize text-[#B23A25]">{i}</span>
      ))}
    </div>
  );
}

/**
 * Occasion Kit — pick where you're headed, get a tailored prep kit (what to
 * wear from your own colours, how to groom, which photo/how to show up, and the
 * classic mistake to skip). Consolidates the three things people google
 * separately before any event, personalised to the traits the scan produced.
 */
export function OccasionKitCard(traits: OccasionTraits) {
  const [occasion, setOccasion] = useState<Occasion>("first-date");
  const kit = useMemo(() => buildOccasionKit(occasion, traits), [occasion, traits]);

  return (
    <div className="rounded-2xl border border-[#1c1917]/[0.08] bg-gradient-to-b from-[#1c1917]/[0.03] to-transparent p-5 sm:p-6">
      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#B23A25]">Occasion Kits</p>
      <h3 className="mt-0.5 text-base font-bold text-[#1C1917]">Getting ready for something? Pick it.</h3>
      <p className="mt-1 text-xs text-[#6f675e]">What to wear (from your colours), how to groom, which photo, and the mistake to skip — tailored to you, for wherever you&apos;re headed.</p>

      {/* Occasion picker */}
      <div className="mt-4 flex flex-wrap gap-1.5">
        {OCCASIONS.map((o) => (
          <button
            key={o.id}
            onClick={() => setOccasion(o.id)}
            className={`rounded-lg border px-3 py-1.5 text-[11px] font-semibold transition-all ${occasion === o.id ? "border-[#E14434]/50 bg-[#E14434]/[0.08] text-[#B23A25]" : "border-[#1c1917]/10 bg-[#1c1917]/[0.02] text-[#1C1917] hover:border-[#1c1917]/20"}`}
          >
            {o.emoji} {o.label}
          </button>
        ))}
      </div>

      {/* The kit */}
      <div className="mt-4 space-y-3">
        <div className="rounded-xl border border-[#E14434]/20 bg-[#E14434]/[0.06] p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-[#B23A25]">The vibe</p>
          <p className="text-sm font-semibold text-[#1C1917]">{kit.vibe}</p>
        </div>

        <div className="rounded-xl border border-[#1c1917]/[0.06] bg-white/50 p-3.5">
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#857b6e]">👕 Wear</p>
          <p className="text-xs text-[#33302b]">{kit.wear}</p>
          {kit.colors.length > 0 && <div className="mt-2.5"><Chips items={kit.colors} /></div>}
          {/* Shop this fit */}
          <div className="mt-3 border-t border-[#1c1917]/[0.06] pt-2.5">
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#857b6e]">🛍️ Shop this fit</p>
            <div className="flex flex-wrap gap-1.5">
              {shopQueries(occasion, (traits.powerColors?.[0] || kit.colors[0] || "").toLowerCase(), traits.gender).map((q) => (
                <a
                  key={q.label}
                  href={searchLink(q.query, "amazon")}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  onClick={() => trackEvent(EVENTS.SHOP_LINK_CLICKED, { retailer: "amazon", lookCategory: "outfit" })}
                  className="inline-flex items-center gap-1 rounded-full border border-[#1c1917]/10 bg-[#fbf8f2]/70 px-2.5 py-1 text-[11px] font-semibold text-[#1C1917] transition-colors hover:border-[#E14434]/40"
                >
                  {q.label} →
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-[#1c1917]/[0.06] bg-white/50 p-3.5">
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#857b6e]">✂️ Groom</p>
          <ul className="space-y-1">
            {kit.groom.map((g) => (
              <li key={g} className="flex items-start gap-2 text-xs text-[#4a443d]">
                <span className="mt-px flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-[9px] text-emerald-700">✓</span>
                {g}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-[#1c1917]/[0.06] bg-white/50 p-3.5">
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#857b6e]">📸 Show up</p>
          <p className="text-xs text-[#33302b]">{kit.presence}</p>
        </div>

        <p className="text-[11px] text-[#9c9184]">✕ {kit.avoid}</p>
      </div>
    </div>
  );
}
