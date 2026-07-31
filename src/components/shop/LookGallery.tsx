"use client";

import { useMemo, useState } from "react";
import { FadeInView } from "@/components/ui/FadeInView";
import { ShopCategoryImage } from "@/components/shop/ShopCategoryImage";
import { buildPrimaryShopLink } from "@/lib/shop/linkBuilder";
import { formatLookPrice } from "@/lib/shop/pricing";
import { getAllLooks } from "@/lib/shop/catalog";
import { STYLE_COLLECTIONS, getCollectionLooks } from "@/lib/shop/styleCollections";
import { trackEvent, EVENTS } from "@/lib/analytics/events";
import type { Look, LookCategory } from "@/lib/shop/catalogTypes";

// A "look" is a coordinated outfit, not a single product — top + bottom +
// footwear + one accent, styled to a vibe.
const SLOTS: { key: string; cats: LookCategory[] }[] = [
  { key: "top", cats: ["tshirt", "shirt", "hoodie", "sweatshirt", "jacket", "kurta", "dress", "saree"] },
  { key: "bottom", cats: ["jeans", "trousers", "shorts"] },
  { key: "footwear", cats: ["sneakers", "shoes", "sandals", "heels", "flats"] },
  { key: "accent", cats: ["watch", "sunglasses", "backpack", "accessory", "earrings", "fragrance"] },
];

// Photo-gear items (backdrops, lights, tripods) are catalogued under apparel
// categories like "accessory" but belong in the Photo Kit, never in an outfit.
const GEAR_TAGS = new Set(["background", "lighting", "clarity", "resolution", "phone_condition", "room_clutter"]);
const isApparel = (l: Look) => !(l.statusLeakTags || []).some((t) => GEAR_TAGS.has(t));

interface StyledLook {
  id: string;
  vibe: string;
  emoji: string;
  tagline: string;
  pieces: Look[];
  total: number;
}

/** Build up to `perVibe` coordinated outfits from a collection's items. Each
 * outfit prefers pieces not used by an earlier outfit of the same vibe. */
function buildLooks(collectionLooks: Look[], perVibe: number): Look[][] {
  const apparel = collectionLooks.filter(isApparel);
  const bySlot = SLOTS.map((s) => apparel.filter((l) => s.cats.includes(l.category) && l.price > 0).sort((a, b) => a.price - b.price));
  const outfits: Look[][] = [];
  const usedGlobal = new Set<string>();
  for (let n = 0; n < perVibe; n++) {
    const pieces: Look[] = [];
    for (const slot of bySlot) {
      if (slot.length === 0) continue;
      const fresh = slot.find((l) => !usedGlobal.has(l.id));
      const chosen = fresh || slot[n % slot.length];
      if (chosen) { usedGlobal.add(chosen.id); pieces.push(chosen); }
    }
    if (pieces.length >= 3) outfits.push(pieces);
  }
  return outfits;
}

/** Deterministically build the styled-look set once, shared by the homepage
 * band and the /shop page so both speak the same "shop the fit" language. */
export function useStyledLooks(perVibe = 2): StyledLook[] {
  return useMemo(() => {
    const all = getAllLooks();
    const out: StyledLook[] = [];
    for (const c of STYLE_COLLECTIONS) {
      buildLooks(getCollectionLooks(c.id, all), perVibe).forEach((pieces, i) => {
        out.push({
          id: `${c.id}-${i}`,
          vibe: c.name,
          emoji: c.emoji,
          tagline: c.tagline,
          pieces: pieces.slice(0, 4),
          total: pieces.reduce((s, p) => s + p.price, 0),
        });
      });
    }
    return out;
  }, [perVibe]);
}

/**
 * A gallery of curated LOOKS — complete outfits per aesthetic, each piece
 * affiliate-tagged and shoppable. Shared by the homepage and /shop so shopping
 * is look-first everywhere. `initial` controls how many show before "show all".
 */
export function LookGallery({ initial = 6, perVibe = 2 }: { initial?: number; perVibe?: number }) {
  const looks = useStyledLooks(perVibe);
  const [expanded, setExpanded] = useState(false);
  const shown = expanded ? looks : looks.slice(0, initial);

  return (
    <>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((look, i) => (
          <FadeInView key={look.id} delay={Math.min(i * 50, 300)}>
            <div className="group flex h-full flex-col overflow-hidden rounded-3xl border border-[#1c1917]/[0.08] bg-gradient-to-b from-[#FBF8F2] to-[#F2ECE1]/50 shadow-[0_1px_0_rgba(255,255,255,0.6)_inset]">
              {/* Vibe header */}
              <div className="flex items-center justify-between gap-2 border-b border-[#1c1917]/[0.06] px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{look.emoji}</span>
                  <div>
                    <p className="text-sm font-bold leading-none text-[#1C1917]">{look.vibe}</p>
                    <p className="mt-0.5 text-[11px] text-[#857b6e]">{look.tagline}</p>
                  </div>
                </div>
                {look.total > 0 && (
                  <span className="shrink-0 rounded-full bg-[#E14434]/10 px-2.5 py-1 text-[11px] font-bold text-[#B23A25]">
                    fit ≈ ₹{look.total.toLocaleString("en-IN")}
                  </span>
                )}
              </div>

              {/* The pieces */}
              <div className="grid grid-cols-2 gap-2.5 p-3">
                {look.pieces.map((p) => (
                  <a
                    key={p.id}
                    href={buildPrimaryShopLink({ category: p.category, keywords: p.keywords, gender: p.gender })}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                    onClick={() => trackEvent(EVENTS.SHOP_LINK_CLICKED, { retailer: "amazon", lookCategory: p.category })}
                    className="flex flex-col overflow-hidden rounded-xl border border-[#1c1917]/[0.06] bg-[#FBF8F2] transition-all hover:-translate-y-0.5 hover:border-[#E14434]/30"
                  >
                    <div className="overflow-hidden">
                      <div className="transition-transform duration-500 group-hover:scale-[1.04]">
                        <ShopCategoryImage category={p.category} title={p.title} keywords={p.keywords} />
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-1 px-2 py-1.5">
                      <span className="line-clamp-1 text-[11px] font-medium text-[#4a443d]">{p.title}</span>
                      <span className="shrink-0 text-[11px] font-semibold text-amber-600">{formatLookPrice(p.price)}</span>
                    </div>
                  </a>
                ))}
              </div>

              <div className="mt-auto px-3 pb-3">
                <div className="flex items-center justify-between rounded-xl bg-[#1C1917] px-3.5 py-2.5">
                  <span className="text-xs font-semibold text-white">Tap any piece to shop the fit</span>
                  <span className="text-xs font-bold text-[#ff8a6c]">{look.pieces.length} pieces</span>
                </div>
              </div>
            </div>
          </FadeInView>
        ))}
      </div>

      {!expanded && looks.length > initial && (
        <div className="mt-8 text-center">
          <button
            onClick={() => setExpanded(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#1c1917]/15 px-5 py-2.5 text-sm font-semibold text-[#4a443d] transition-colors hover:border-[#E14434]/40 hover:text-[#1C1917]"
          >
            Show all {looks.length} looks →
          </button>
        </div>
      )}
    </>
  );
}
