"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Container } from "@/components/ui/Container";
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

interface StyledLook {
  id: string;
  vibe: string;
  emoji: string;
  tagline: string;
  pieces: Look[];
  total: number;
}

// Photo-gear items (backdrops, lights, tripods) are catalogued under apparel
// categories like "accessory" but belong in the Photo Kit, never in an outfit.
// Their status-leak tags are the tell.
const GEAR_TAGS = new Set(["background", "lighting", "clarity", "resolution", "phone_condition", "room_clutter"]);
const isApparel = (l: Look) => !(l.statusLeakTags || []).some((t) => GEAR_TAGS.has(t));

/** Build up to `perVibe` coordinated outfits from a collection's items. Each
 * outfit prefers pieces not used by an earlier outfit of the same vibe, so the
 * variants feel distinct; a thin slot falls back to reuse rather than a gap. */
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

/**
 * Homepage "Shop the vibe" — the free shopping tier, built around curated LOOKS
 * (complete outfits per aesthetic) rather than a wall of individual products.
 * Fewer, richer, aspirational cards a GenZ shopper actually wants to copy;
 * every piece is affiliate-tagged and shoppable. The full catalog + picks
 * matched to your own photo unlock with any ₹25 report.
 */
export function ShopTheVibeBand() {
  const [expanded, setExpanded] = useState(false);

  const looks = useMemo<StyledLook[]>(() => {
    const all = getAllLooks();
    const out: StyledLook[] = [];
    for (const c of STYLE_COLLECTIONS) {
      const pool = getCollectionLooks(c.id, all);
      const outfits = buildLooks(pool, 2);
      outfits.forEach((pieces, i) => {
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
  }, []);

  const shown = expanded ? looks : looks.slice(0, 6);

  return (
    <section id="shop" className="scroll-mt-20 py-16 sm:py-20">
      <Container>
        <FadeInView>
          <div className="mb-10 text-center">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-500/25 bg-amber-500/10 px-3 py-1">
              <span className="text-xs">🛍️</span>
              <span className="text-xs font-medium uppercase tracking-[0.14em] text-amber-600">Shop the vibe · free</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-[#1C1917] sm:text-3xl">
              Steal the whole fit, not just one piece
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm text-[#6F675E]">
              Complete looks that photograph well — each one styled to a vibe and ready to shop. Picks matched to <em>your</em> photo unlock with any ₹25 report.
            </p>
          </div>
        </FadeInView>

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

                {/* Shop the fit */}
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

        {!expanded && looks.length > 6 && (
          <div className="mt-8 text-center">
            <button
              onClick={() => setExpanded(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#1c1917]/15 px-5 py-2.5 text-sm font-semibold text-[#4a443d] transition-colors hover:border-[#E14434]/40 hover:text-[#1C1917]"
            >
              Show all {looks.length} free looks →
            </button>
          </div>
        )}

        {/* Unlock the full shop */}
        <FadeInView delay={120}>
          <div className="mt-12 rounded-2xl border border-[#E14434]/20 bg-gradient-to-b from-[#E14434]/[0.06] to-transparent p-6 text-center">
            <p className="text-sm font-semibold text-[#1C1917]">Want looks built for your face, colours & vibe?</p>
            <p className="mx-auto mt-1 max-w-md text-xs text-[#6f675e]">
              Unlock the full catalog, your personalized buy list, colour palette, and capsule wardrobe with any ₹25 report.
            </p>
            <Link
              href="/audit/new"
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-[#1C1917] px-6 py-3 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
            >
              Scan &amp; unlock your looks →
            </Link>
            <p className="mx-auto mt-4 max-w-md text-[10px] text-[#9c9184]">
              FixMyAura may earn a commission on purchases through these links, at no extra cost to you.
            </p>
          </div>
        </FadeInView>
      </Container>
    </section>
  );
}
