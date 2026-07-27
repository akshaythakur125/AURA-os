"use client";

import Link from "next/link";
import { Card } from "@/components/ui/Card";
import type { Look, LookCategory } from "@/lib/shop/catalogTypes";
import { buildPrimaryShopLink } from "@/lib/shop/linkBuilder";
import { formatLookPrice } from "@/lib/shop/pricing";
import { ShopCategoryImage } from "@/components/shop/ShopCategoryImage";
import { trackEvent, EVENTS } from "@/lib/analytics/events";

/**
 * "Complete the look" — assembles ONE coordinated outfit (top + bottom +
 * footwear + an accent) from the personalized looks, with a combined total and
 * a direct affiliate link per piece. Bigger basket than a single item, and it
 * answers what shoppers actually want: the whole fit, not the parts.
 */
const GROUPS: { key: string; cats: LookCategory[] }[] = [
  { key: "top", cats: ["tshirt", "shirt", "hoodie", "sweatshirt", "jacket", "kurta", "dress", "saree"] },
  { key: "bottom", cats: ["jeans", "trousers", "shorts"] },
  { key: "footwear", cats: ["sneakers", "shoes", "sandals", "heels", "flats"] },
  { key: "accent", cats: ["watch", "sunglasses", "backpack", "accessory", "earrings", "fragrance"] },
];

export function CompleteTheLookCard({ looks, archetype }: { looks: Look[]; archetype?: string }) {
  const pieces: Look[] = [];
  for (const g of GROUPS) {
    const pick = looks.find((l) => g.cats.includes(l.category) && !pieces.some((p) => p.id === l.id));
    if (pick) pieces.push(pick);
  }
  if (pieces.length < 2) return null;

  const total = pieces.reduce((sum, p) => sum + (p.price > 0 ? p.price : 0), 0);

  return (
    <Card className="mb-6">
      <div className="mb-1 flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-sm font-semibold text-[#1C1917]">🧩 Complete the look</h3>
        {total > 0 && (
          <span className="text-xs font-semibold text-[#B23A25]">Full fit ≈ ₹{total.toLocaleString("en-IN")}</span>
        )}
      </div>
      <p className="mb-4 text-xs text-[#857b6e]">
        A coordinated {archetype ? `${archetype} ` : ""}outfit built from your picks — grab the whole thing, not just one piece.
      </p>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {pieces.map((p) => (
          <div key={p.id} className="flex flex-col rounded-xl border border-[#1c1917]/[0.07] bg-[#fbf8f2]/60 p-2">
            <ShopCategoryImage category={p.category} title={p.title} keywords={p.keywords} />
            <Link href={"/shop/look/" + p.id} className="mt-2 line-clamp-2 text-xs font-semibold text-[#1C1917] hover:underline">
              {p.title}
            </Link>
            <span className="mt-0.5 text-[11px] font-medium text-emerald-700">{formatLookPrice(p.price)}</span>
            <a
              href={buildPrimaryShopLink({ category: p.category, keywords: p.keywords, gender: p.gender })}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent(EVENTS.SHOP_LINK_CLICKED, { retailer: "amazon", lookCategory: p.category })}
              className="mt-2 rounded-lg bg-[#1C1917] px-2 py-1.5 text-center text-[11px] font-semibold text-white transition-opacity hover:opacity-90"
            >
              Shop →
            </a>
          </div>
        ))}
      </div>
    </Card>
  );
}
