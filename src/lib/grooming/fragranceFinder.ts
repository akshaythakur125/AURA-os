/**
 * Fragrance Finder — matches the person's scent family (already derived by
 * scentProfileFor from their archetype/goal) to a precise, budget-tiered
 * "what to buy" spec: the note families to look for and a search that surfaces
 * real, current products.
 *
 * ACCURACY BY DESIGN: this never hardcodes a product name or image. It emits a
 * note-spec + a retailer SEARCH query, so the live listing shows the correct
 * product with its own correct image — there is no fixed image to drift out of
 * sync with a label. Pure/deterministic, no key.
 */

export interface FragrancePick {
  tier: string;      // "Everyday" | "Signature" | "Statement"
  priceHint: string;
  note: string;      // what this tier gets you
  query: string;     // retailer search query
}

export interface FragranceGuide {
  label: string;     // e.g. "Warm woody-spicy"
  lookFor: string[]; // accurate note families to scan a bottle's pyramid for
  picks: FragrancePick[];
  applyTip: string;
  buyTip: string;
}

type Family = "warm" | "fresh" | "floral";

function resolveFamily(families?: string[]): Family {
  const set = new Set((families || []).map((f) => f.toLowerCase()));
  if (["woody", "oud", "spicy", "amber", "oriental", "leather", "smoky"].some((f) => set.has(f))) return "warm";
  if (["floral", "fruity"].some((f) => set.has(f)) && !["citrus", "aquatic", "fresh"].some((f) => set.has(f))) return "floral";
  return "fresh";
}

const SPEC: Record<Family, { label: string; lookFor: string[]; term: string }> = {
  warm: {
    label: "Warm woody-spicy",
    lookFor: ["sandalwood", "cedar", "vetiver", "amber", "black pepper", "cardamom", "tobacco"],
    term: "woody spicy",
  },
  fresh: {
    label: "Fresh citrus-aquatic",
    lookFor: ["bergamot", "lemon", "marine / aquatic", "mint", "green tea", "grapefruit"],
    term: "fresh citrus aquatic",
  },
  floral: {
    label: "Bright floral",
    lookFor: ["rose", "jasmine", "peony", "musk", "light fruit"],
    term: "floral",
  },
};

export function buildFragranceGuide(opts: { families?: string[]; gender?: string; budget?: number }): FragranceGuide {
  const fam = resolveFamily(opts.families);
  const spec = SPEC[fam];
  const g = opts.gender === "men" ? " men" : opts.gender === "women" ? " women" : " unisex";
  const term = spec.term;

  const picks: FragrancePick[] = [
    { tier: "Everyday", priceHint: "₹500–1,200", note: "A long-lasting daily scent — apply freely, it's your signature-in-training.", query: `long lasting ${term} perfume${g} under 1200` },
    { tier: "Signature", priceHint: "₹1,500–3,500", note: "A proper eau de parfum with real projection — the one people remember you by.", query: `${term} eau de parfum${g}` },
    { tier: "Statement", priceHint: "₹4,000+", note: "A designer EDP for dates and events — save it for when it counts.", query: `designer ${term} eau de parfum${g}` },
  ];

  return {
    label: spec.label,
    lookFor: spec.lookFor,
    picks,
    applyTip: "Apply 2 sprays to pulse points (neck, wrists) — don't rub, it crushes the top notes. One spray on the shirt collar makes it last all day.",
    buyTip: "Always test on skin and wait 15 minutes before buying — the same scent smells different on everyone. Decants (5–10ml) are a cheap way to trial before you commit.",
  };
}
