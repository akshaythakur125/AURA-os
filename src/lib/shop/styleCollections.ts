import type { Look } from "./catalogTypes";

/**
 * Style Collections — named GenZ aesthetics layered over the catalog.
 *
 * Each collection is a curated lens: a matcher that pulls every catalog look
 * whose type/keywords/archetypes belong to that aesthetic. Because collections
 * filter the same Look objects the resolver and link-builder read, a look
 * shown in a collection always carries its own correctly-matched image and
 * retailer links — the collection can't drift from the products.
 */

export interface StyleCollection {
  id: string;
  name: string;
  emoji: string;
  tagline: string;
  test: (look: Look) => boolean;
}

const kw = (look: Look, ...words: string[]) => {
  const hay = (look.title + " " + look.keywords.join(" ")).toLowerCase();
  return words.some((w) => hay.includes(w));
};
const arch = (look: Look, ...a: string[]) => look.styleArchetypes.some((s) => a.includes(s));
const cat = (look: Look, ...c: string[]) => c.includes(look.category);

export const STYLE_COLLECTIONS: StyleCollection[] = [
  {
    id: "streetwear",
    name: "Streetwear",
    emoji: "🛹",
    tagline: "oversized fits, chunky kicks",
    test: (l) => kw(l, "oversized", "cargo", "graphic", "street", "hoodie", "high-top", "boxy") || (cat(l, "hoodie", "sweatshirt") && arch(l, "bold", "creator")),
  },
  {
    id: "old-money",
    name: "Old Money",
    emoji: "🏛️",
    tagline: "quiet luxury, zero logos",
    test: (l) => kw(l, "polo", "pique", "oxford", "linen", "loafer", "chino", "tailored", "blazer", "camp collar", "campcollar") || (arch(l, "premium", "understated") && cat(l, "shirt", "trousers", "watch")),
  },
  {
    id: "minimal",
    name: "Clean Minimal",
    emoji: "⬜",
    tagline: "solids only, sharp lines",
    test: (l) => arch(l, "clean") && (kw(l, "white", "black", "navy", "grey", "minimal", "solid", "slim", "crew") || cat(l, "watch", "sneakers")),
  },
  {
    id: "y2k",
    name: "Y2K / Retro",
    emoji: "💿",
    tagline: "baby tees, platforms, throwback",
    test: (l) => kw(l, "crop", "baby tee", "platform", "mom", "momfit", "retro", "round", "breton", "hoop", "y2k"),
  },
  {
    id: "athleisure",
    name: "Athleisure",
    emoji: "🏃",
    tagline: "gym-to-café energy",
    test: (l) => kw(l, "jogger", "athleisure", "running", "mesh", "track", "sport", "sweatpants") || cat(l, "shorts"),
  },
  {
    id: "office-core",
    name: "Office Core",
    emoji: "💼",
    tagline: "corporate but make it fashion",
    test: (l) => arch(l, "professional") || kw(l, "formal", "tailored", "blazer", "dress shirt", "oxford"),
  },
  {
    id: "date-night",
    name: "Date Night",
    emoji: "🌹",
    tagline: "first-impression heavy hitters",
    test: (l) => arch(l, "attractive") || kw(l, "midi", "wrap", "bodycon", "cocktail", "heel", "fragrance", "parfum", "eau de") || cat(l, "fragrance", "heels", "dress"),
  },
  {
    id: "campus",
    name: "Campus Fit",
    emoji: "🎓",
    tagline: "effortless everyday rotation",
    test: (l) => arch(l, "college") || l.goalTags.includes("college") || cat(l, "backpack"),
  },
  {
    id: "desi-fusion",
    name: "Desi Fusion",
    emoji: "🪔",
    tagline: "ethnic staples, modern styling",
    test: (l) => cat(l, "kurta", "saree") || kw(l, "kurta", "kurti", "saree", "blockprint", "ethnic"),
  },
  {
    id: "soft-aesthetic",
    name: "Soft Aesthetic",
    emoji: "🎀",
    tagline: "florals, golds, gentle tones",
    test: (l) => kw(l, "floral", "peony", "rose", "sage", "cream", "nude", "gold", "delicate", "ballet"),
  },
  {
    id: "grunge",
    name: "Grunge / Alt",
    emoji: "🖤",
    tagline: "black on black, boots on",
    test: (l) => (kw(l, "black", "dark", "suede", "leather") && cat(l, "jacket", "shoes", "jeans", "sunglasses")) || kw(l, "chelsea", "biker", "moto", "boot"),
  },
  {
    id: "clean-girl",
    name: "Clean Girl",
    emoji: "✨",
    tagline: "sleek buns and glossy basics",
    test: (l) => kw(l, "sleek", "bodysuit", "hoop", "layered", "fitted", "crossbody") || cat(l, "grooming", "earrings"),
  },
];

/** Looks that belong to a collection (deterministic, catalog-derived). */
export function getCollectionLooks(collectionId: string, looks: Look[]): Look[] {
  const col = STYLE_COLLECTIONS.find((c) => c.id === collectionId);
  if (!col) return [];
  return looks.filter(col.test);
}
