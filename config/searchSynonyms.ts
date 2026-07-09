// Search synonym map: expands user queries and aura-generated queries
// to match more products in the index.

export const SEARCH_SYNONYMS: Record<string, string[]> = {
  // ─── Category/Product Synonyms ───
  overshirt: ["shacket", "casual shirt", "layering shirt", "over shirt", "oversize shirt"],
  shirt: ["button down", "button-up", "formal shirt", "casual shirt", "linen shirt"],
  tshirt: ["t-shirt", "tee", "t shirt", "crew neck", "round neck"],
  sneakers: ["shoes", "white shoes", "casual shoes", "sneaker", "trainers", "sport shoes"],
  jeans: ["denim", "denims", "jean"],
  trousers: ["pants", "formal pants", "trouser", "suit pants"],
  chinos: ["chino", "khaki", "cotton pants", "cargo"],
  hoodie: ["hoody", "sweatshirt", "pullover", "sweater"],
  jacket: ["coat", "blazer", "bomber", "leather jacket", "denim jacket"],
  watch: ["wrist watch", "timepiece", "analog watch", "digital watch"],
  belt: ["leather belt", "waist belt", "canvas belt"],
  sunglasses: ["shades", "sun glasses", "sun shades", "wayfarer"],
  kurta: ["kurti", "ethnic top", "indian wear"],
  perfume: ["cologne", "fragrance", "deodorant", "body spray", "attar"],
  wallet: ["card holder", "money clip", "bifold", "trifold"],
  formal_shoes: ["oxford", "derby", "loafers", "brogues", "lace up shoes"],
  jewellery: ["jewelry", "accessories", "bracelet", "chain", "necklace", "ring"],

  // ─── Style Directions ───
  "premium minimal": ["neutral", "clean", "solid", "understated", "minimal", "simple", "basic", "monochrome"],
  "dating warm": ["soft colors", "clean shirt", "warm", "approachable", "soft", "romantic"],
  "college casual": ["tee", "overshirt", "sneakers", "hoodie", "casual", "student"],
  "corporate sharp": ["oxford", "formal shirt", "chinos", "trousers", "belt", "office", "professional"],
  "creator bold": ["jacket", "bold color", "statement layer", "assertive", "loud", "statement"],
  "urban aspirational": ["urban", "streetwear", "modern", "edgy", "city"],
  "clean basic": ["neutrals", "white", "black", "minimal", "essentials", "timeless"],
  "soft luxury": ["premium", "luxe", "high end", "elegant", "refined"],
  "street smart": ["streetwear", "sneakers", "urban", "edgy", "graphic"],
  "ethnic clean": ["kurta", "indian", "ethnic", "traditional", "festival"],
  "gym casual": ["athleisure", "sport", "gym wear", "track pants", "joggers"],
  "understated confident": ["subtle", "confident", "quiet", "refined", "elegant"],

  // ─── Aura Leaks / Visual Fixes ───
  "weak lighting": ["ring light", "lamp", "tripod", "lens cloth", "better light"],
  "busy background": ["neutral cloth", "room lamp", "clean backdrop", "plain wall"],
  "weak clarity": ["better camera", "phone upgrade", "tripod", "stable shot"],
  "weak framing": ["tripod", "selfie stand", "phone holder"],
  "outfit inconsistency": ["overshirt", "clean shoes", "matching belt", "coordinated"],
  "low premium signal": ["watch", "belt", "shoes", "minimal", "clean"],
  "too plain": ["accessories", "watch", "chain", "bracelet", "layering"],
  "color mismatch": ["neutrals", "monochrome", "muted tones", "coordinated"],
  "professional mismatch": ["formal shirt", "blazer", "belt", "trousers", "polished"],
  "dating warmth missing": ["soft colors", "clean shirt", "smile", "open body language"],
  "creator energy missing": ["statement piece", "bold", "jacket", "distinctive"],

  // ─── Color Synonyms ───
  black: ["black", "charcoal", "ebony", "jet black"],
  white: ["white", "ivory", "cream", "off-white", "pure white"],
  blue: ["blue", "navy", "royal blue", "sky blue", "indigo"],
  gray: ["grey", "gray", "charcoal", "ash", "smoke"],
  brown: ["brown", "tan", "camel", "beige", "khaki", "taupe"],
  green: ["green", "olive", "forest", "emerald", "sage"],
  red: ["red", "burgundy", "maroon", "crimson", "wine"],
  neutral: ["white", "black", "gray", "beige", "cream", "navy", "brown"],

  // ─── Budget / Price ───
  cheap: ["budget", "affordable", "under 500", "under 1000", "low price", "inexpensive"],
  expensive: ["premium", "luxury", "high end", "designer"],
};

export function expandQuery(query: string): string[] {
  const normalized = query.toLowerCase().trim();
  if (!normalized) return [query];

  const results = [query];
  const words = normalized.split(/\s+/);

  for (const word of words) {
    const synonym = SEARCH_SYNONYMS[word];
    if (synonym) {
      results.push(...synonym);
    }
  }

  // Check multi-word phrases
  if (SEARCH_SYNONYMS[normalized]) {
    results.push(...SEARCH_SYNONYMS[normalized]);
  }

  return [...new Set(results)];
}

export function buildSearchTokens(query: string): string[] {
  const normalized = query.toLowerCase().trim();
  const tokens = normalized.split(/\s+/).filter(Boolean);
  const expanded = expandQuery(query);
  const allWords = new Set<string>();

  for (const phrase of expanded) {
    phrase.split(/\s+/).forEach((w) => {
      const clean = w.toLowerCase().replace(/[^a-z0-9]/g, "").trim();
      if (clean) allWords.add(clean);
    });
  }

  tokens.forEach((t) => allWords.add(t));
  return [...allWords];
}
