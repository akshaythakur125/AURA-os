import type { Look, LookCategory } from "./catalogTypes";
import { requestedColors, colorRelation } from "./shopImage";

// A coordinated outfit is one item per slot: top + bottom + footwear + accent.
export const OUTFIT_SLOTS: { key: string; cats: LookCategory[] }[] = [
  { key: "top", cats: ["tshirt", "shirt", "hoodie", "sweatshirt", "jacket", "kurta", "dress", "saree"] },
  { key: "bottom", cats: ["jeans", "trousers", "shorts"] },
  { key: "footwear", cats: ["sneakers", "shoes", "sandals", "heels", "flats"] },
  { key: "accent", cats: ["watch", "sunglasses", "backpack", "accessory", "earrings", "fragrance"] },
];

// Photo-gear items (backdrops, lights, tripods) are catalogued under apparel
// categories like "accessory" but belong in the Photo Kit, never in an outfit.
const GEAR_TAGS = new Set(["background", "lighting", "clarity", "resolution", "phone_condition", "room_clutter"]);
export const isApparel = (l: Look) => !(l.statusLeakTags || []).some((t) => GEAR_TAGS.has(t));

/**
 * Build up to `count` coordinated outfits from a pool of looks. Each outfit is
 * one piece per slot, cheapest-first, and prefers pieces not already used by an
 * earlier outfit so the variants feel distinct; a thin slot falls back to reuse
 * rather than leaving a gap. Shared by the homepage look gallery and the paid
 * report's "complete the look" so shopping speaks one language everywhere.
 */
export function buildOutfits(pool: Look[], count: number, opts?: { paletteColors?: string[] }): Look[][] {
  const apparel = pool.filter(isApparel);
  // When a colour palette is supplied, order each slot by colour flattery first
  // (a match beats a clash), then price — so the outfit stays in the person's
  // undertone colours instead of just grabbing the cheapest piece.
  const palette = opts?.paletteColors?.length ? requestedColors(opts.paletteColors.join(" ")) : null;
  const colorRank = (l: Look): number => {
    if (!palette) return 0;
    const cols = requestedColors(`${l.title} ${l.keywords.join(" ")}`);
    if (!cols.size) return 2; // colourless piece — neutral middle
    const rel = colorRelation(palette, cols);
    return rel === "match" ? 0 : rel === "compatible" ? 1 : 3;
  };
  const bySlot = OUTFIT_SLOTS.map((s) =>
    apparel
      .filter((l) => s.cats.includes(l.category) && l.price > 0)
      .sort((a, b) => colorRank(a) - colorRank(b) || a.price - b.price),
  );
  const outfits: Look[][] = [];
  const used = new Set<string>();
  for (let n = 0; n < count; n++) {
    const pieces: Look[] = [];
    for (const slot of bySlot) {
      if (slot.length === 0) continue;
      const fresh = slot.find((l) => !used.has(l.id));
      const chosen = fresh || slot[n % slot.length];
      if (chosen) { used.add(chosen.id); pieces.push(chosen); }
    }
    if (pieces.length >= 3) outfits.push(pieces);
  }
  return outfits;
}
