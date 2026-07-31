"use client";

import { Card } from "@/components/ui/Card";
import type { Look } from "@/lib/shop/catalogTypes";
import { buildOutfits } from "@/lib/shop/outfits";
import { buildPrimaryShopLink } from "@/lib/shop/linkBuilder";
import { formatLookPrice } from "@/lib/shop/pricing";
import { ShopCategoryImage } from "@/components/shop/ShopCategoryImage";
import { trackEvent, EVENTS } from "@/lib/analytics/events";

/**
 * "Your looks" — the paid report's shopping, made look-first: instead of a
 * loose list of products it assembles 2–3 complete, coordinated outfits from
 * the shopper's personalized (archetype-matched) picks, each with a combined
 * fit total and a direct affiliate link per piece. Same "shop the fit" language
 * as the homepage gallery, personalised to this person.
 */
export function CompleteTheLookCard({
  looks,
  archetype,
  paletteColors,
  undertone,
  undertoneConfident = true,
}: {
  looks: Look[];
  archetype?: string;
  paletteColors?: string[];
  undertone?: "warm" | "cool" | "neutral";
  undertoneConfident?: boolean;
}) {
  const outfits = buildOutfits(looks, 3, { paletteColors });
  if (outfits.length === 0) return null;

  return (
    <Card className="mb-6">
      <div className="mb-1 flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-sm font-semibold text-[#1C1917]">🧩 Your looks — shop the whole fit</h3>
        {archetype && <span className="text-xs font-semibold text-[#B23A25]">{archetype}</span>}
      </div>
      <p className="mb-4 text-xs text-[#857b6e]">
        Coordinated {archetype ? `${archetype} ` : ""}outfits built from your picks{undertone ? `, in colours that ${undertoneConfident ? `flatter your ${undertone} undertone` : `suit a ${undertone}-leaning undertone`}` : ""} — grab the whole thing, not just one piece.
      </p>

      <div className="space-y-4">
        {outfits.map((pieces, oi) => {
          const total = pieces.reduce((s, p) => s + (p.price > 0 ? p.price : 0), 0);
          return (
            <div key={oi} className="overflow-hidden rounded-2xl border border-[#1c1917]/[0.08] bg-[#fbf8f2]/50">
              <div className="flex items-center justify-between border-b border-[#1c1917]/[0.06] px-3.5 py-2">
                <span className="text-xs font-bold text-[#1C1917]">Look {oi + 1}</span>
                {total > 0 && <span className="rounded-full bg-[#E14434]/10 px-2.5 py-1 text-[11px] font-bold text-[#B23A25]">fit ≈ ₹{total.toLocaleString("en-IN")}</span>}
              </div>
              <div className="grid grid-cols-2 gap-2.5 p-3 sm:grid-cols-4">
                {pieces.map((p) => (
                  <a
                    key={p.id}
                    href={buildPrimaryShopLink({ category: p.category, keywords: p.keywords, gender: p.gender })}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                    onClick={() => trackEvent(EVENTS.SHOP_LINK_CLICKED, { retailer: "amazon", lookCategory: p.category })}
                    className="flex flex-col overflow-hidden rounded-xl border border-[#1c1917]/[0.06] bg-[#FBF8F2] transition-all hover:-translate-y-0.5 hover:border-[#E14434]/30"
                  >
                    <ShopCategoryImage category={p.category} title={p.title} keywords={p.keywords} />
                    <div className="flex items-center justify-between gap-1 px-2 py-1.5">
                      <span className="line-clamp-1 text-[11px] font-medium text-[#4a443d]">{p.title}</span>
                      <span className="shrink-0 text-[11px] font-semibold text-amber-600">{formatLookPrice(p.price)}</span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
