"use client";

import Link from "next/link";
import { Scene3DAccent } from "@/components/hero/Scene3DAccent";
import { ShopCategoryImage } from "@/components/shop/ShopCategoryImage";
import { formatLookPrice } from "@/lib/shop/pricing";
import type { Look, LookCategory } from "@/lib/shop/catalogTypes";

interface Props {
  looks: Look[];
  archetype?: string;
}

// Wardrobe slots — one piece each builds a mix-and-match capsule.
const SLOTS: { label: string; cats: LookCategory[] }[] = [
  { label: "Top", cats: ["shirt", "tshirt", "hoodie", "sweatshirt", "kurta"] },
  { label: "Bottom", cats: ["jeans", "trousers", "shorts"] },
  { label: "Layer", cats: ["jacket"] },
  { label: "Statement", cats: ["dress", "saree"] },
  { label: "Footwear", cats: ["sneakers", "shoes", "sandals", "heels", "flats"] },
  { label: "Accessory", cats: ["watch", "sunglasses", "backpack", "earrings", "accessory"] },
  { label: "Finishing touch", cats: ["fragrance", "grooming"] },
];

function buildCapsule(looks: Look[]): { slot: string; look: Look }[] {
  const used = new Set<string>();
  const out: { slot: string; look: Look }[] = [];
  for (const slot of SLOTS) {
    const pick = looks.find((l) => slot.cats.includes(l.category) && !used.has(l.id));
    if (pick) {
      used.add(pick.id);
      out.push({ slot: slot.label, look: pick });
    }
  }
  return out;
}

export function CapsuleWardrobeCard({ looks, archetype }: Props) {
  const capsule = buildCapsule(looks);
  if (capsule.length < 3) return null;

  return (
    <div className="rounded-2xl border border-[#1c1917]/[0.08] bg-gradient-to-b from-[#1c1917]/[0.03] to-transparent p-5 sm:p-6">
      {/* Header */}
      <div className="mb-5 flex flex-col items-center gap-3 text-center sm:flex-row sm:text-left">
        <div className="shrink-0">
          <Scene3DAccent size={92} shape="cap" />
        </div>
        <div>
          <h3 className="text-base font-bold text-[#1C1917]">Your Capsule Wardrobe</h3>
          <p className="mt-1 text-xs text-[#6f675e]">
            {capsule.length} pieces that mix and match into a week of{" "}
            <span className="font-medium text-[#B23A25]">{archetype || "polished"}</span> outfits — every item matched
            to your look and shoppable.
          </p>
        </div>
      </div>

      {/* Capsule grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {capsule.map(({ slot, look }) => (
          <Link
            key={look.id}
            href={`/shop/look/${look.id}`}
            className="group flex flex-col rounded-xl border border-[#1c1917]/[0.08] bg-[#1c1917]/[0.02] p-2 transition-all hover:-translate-y-0.5 hover:border-[#E14434]/30"
          >
            <div className="overflow-hidden rounded-lg">
              <div className="transition-transform duration-500 group-hover:scale-[1.05]">
                <ShopCategoryImage category={look.category} title={look.title} keywords={look.keywords} />
              </div>
            </div>
            <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#B23A25]">{slot}</p>
            <p className="line-clamp-1 text-xs font-medium text-[#1C1917]">{look.title}</p>
            <p className="text-[11px] text-amber-500">{formatLookPrice(look.price)}</p>
          </Link>
        ))}
      </div>

      <Link
        href="/shop"
        className="mt-4 inline-flex items-center gap-1.5 rounded-xl border border-[#1c1917]/12 px-4 py-2 text-xs font-semibold text-[#4a443d] transition-colors hover:border-[#E14434]/40 hover:text-[#1C1917]"
      >
        Browse more to complete the kit →
      </Link>
    </div>
  );
}
