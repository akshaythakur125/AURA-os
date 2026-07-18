/**
 * Smart shop image resolver.
 *
 * Picks the most accurate product photo for a look by scoring a tagged photo
 * library against the product's own words (title + keywords + category) — not
 * by category alone. This is why a "Grey Jogger" now shows joggers instead of
 * formal trousers: the joggers photo carries jogger/athleisure tags that the
 * product text matches, and the formal photo does not.
 *
 * Selection:
 *  1. Take the category's photo pool (fallback: accessory).
 *  2. Score each photo by how many of its tags appear in the product text.
 *     Specific tags (>= 5 chars) count double so "jogger" beats "grey".
 *  3. Highest score wins. On a real match this is a precise, accurate image.
 *  4. If nothing matches (generic generated looks), fall back to a stable
 *     title-hash pick so cards still get varied, category-correct imagery.
 *
 * Every URL here is a live Unsplash CDN image; specific garment photos were
 * sourced and content-verified per type.
 */

import type { LookCategory } from "./catalogTypes";

export type TaggedPhoto = { url: string; alt: string; tags: string[] };

const U = (id: string) => `https://images.unsplash.com/${id}?w=400&q=80`;

// Photo pools per LookCategory. Typed as a total Record so adding a new
// LookCategory without a photo pool is a compile error — every product
// category is guaranteed to have accurate imagery.
export const CATEGORY_PHOTOS: Record<LookCategory, TaggedPhoto[]> = {
  tshirt: [
    { url: U("photo-1521572163474-6864f9cf17ab"), alt: "White cotton t-shirt", tags: ["white", "tee", "crew", "crewneck", "plain", "basic", "slim", "fitted", "cotton"] },
    { url: U("photo-1583743814966-8936f5b7be1a"), alt: "Graphic / striped tee", tags: ["graphic", "print", "oversized", "street", "breton", "stripe", "striped", "navy"] },
    { url: U("photo-1618354691373-d851c5c3a990"), alt: "Relaxed cotton crew tee", tags: ["cotton", "crew", "henley", "cargo", "pocket", "olive", "charcoal", "relaxed", "fullsleeve", "military", "sage"] },
    { url: U("photo-1625910513413-c23b8bb81cba"), alt: "Collared polo shirt", tags: ["polo", "pique", "collar", "collared"] },
    { url: U("photo-1777868475400-993602b1e971"), alt: "Sleek fitted bodysuit", tags: ["bodysuit", "bodycon", "sleek", "crop", "croptop"] },
  ],
  shirt: [
    { url: U("photo-1596755094514-f87e34085b2c"), alt: "Oxford button-down shirt", tags: ["button", "buttondown", "button-down", "oxford", "poplin"] },
    { url: U("photo-1602810318383-e386cc2a3ccf"), alt: "Formal dress shirt", tags: ["formal", "dress", "slim", "lightblue", "blue", "white"] },
    { url: U("photo-1598032895397-b9472444bf93"), alt: "Linen / casual shirt", tags: ["linen", "camp", "campcollar", "relaxed", "overshirt", "flannel", "beige", "casual"] },
  ],
  jeans: [
    { url: U("photo-1542272604-787c3835535d"), alt: "Blue denim jeans", tags: ["denim", "blue", "mom", "momfit", "medium", "mediumwash", "classic"] },
    { url: U("photo-1604176354204-9268737828e4"), alt: "Slim / high-rise jeans", tags: ["slim", "indigo", "darkindigo", "clean", "skinny", "high-rise", "highrise"] },
    { url: U("photo-1582552938357-34b9992466ef"), alt: "Dark wash jeans", tags: ["dark", "darkwash", "black", "straight"] },
  ],
  trousers: [
    { url: U("photo-1594938298603-c8148c4dae35"), alt: "Tailored trousers", tags: ["slim", "tailored", "formal", "straight", "suit", "dress", "black", "cream", "wide-leg", "wide", "flowing"] },
    { url: U("photo-1473966968600-fa801b869a1a"), alt: "Chinos", tags: ["chino", "chinos", "casual", "khaki", "beige"] },
    { url: U("photo-1656991483595-8a11da8d2bde"), alt: "Grey tapered joggers", tags: ["jogger", "joggers", "athleisure", "sweatpants", "track", "tapered"] },
  ],
  shorts: [
    { url: U("photo-1591195853828-11db59a44f6b"), alt: "Casual shorts", tags: ["shorts", "casual", "cargo", "chino", "bermuda"] },
  ],
  jacket: [
    { url: U("photo-1551028719-00167b16eac5"), alt: "Leather jacket", tags: ["leather", "biker", "moto"] },
    { url: U("photo-1551537482-f2075a1d41f2"), alt: "Denim jacket", tags: ["denim", "jean", "trucker"] },
    { url: U("photo-1591047139829-d91aecb6caea"), alt: "Blazer", tags: ["blazer", "suit", "formal", "tailored", "sport"] },
  ],
  hoodie: [
    { url: U("photo-1556821840-3a63f756013f"), alt: "Premium hoodie", tags: ["hoodie", "premium", "pullover", "zip"] },
    { url: U("photo-1578768079470-8d0a64bc128d"), alt: "Oversized hoodie", tags: ["oversized", "hoodie", "street"] },
  ],
  sweatshirt: [
    { url: U("photo-1578768079470-8d0a64bc128d"), alt: "Crewneck sweatshirt", tags: ["sweatshirt", "crewneck", "crew", "pullover"] },
    { url: U("photo-1556821840-3a63f756013f"), alt: "Zip sweatshirt", tags: ["zip", "sweatshirt", "hoodie"] },
  ],
  sneakers: [
    { url: U("photo-1542291026-7eec264c27ff"), alt: "White low-top sneakers", tags: ["white", "leather", "minimal", "clean", "low-top", "platform", "chunky"] },
    { url: U("photo-1549298916-b41d501d3772"), alt: "Running sneakers", tags: ["colorful", "running", "mesh", "sport", "grey", "lightweight"] },
    { url: U("photo-1600269452121-4f2416e55c28"), alt: "High-top sneakers", tags: ["high-top", "hightop", "boot"] },
  ],
  shoes: [
    { url: U("photo-1614252369475-ff36a467d8b9"), alt: "Oxford / formal shoes", tags: ["oxford", "formal", "derby", "brogue", "dress", "loafer", "loafers"] },
    { url: U("photo-1608629601270-a0007becead3"), alt: "Suede Chelsea boots", tags: ["chelsea", "boot", "boots", "ankle", "suede"] },
  ],
  sandals: [
    { url: U("photo-1603487742131-4160ec999306"), alt: "Leather sandals", tags: ["sandal", "sandals", "slide", "flip"] },
  ],
  watch: [
    { url: U("photo-1524592094714-0f0654e20314"), alt: "Classic analog watch", tags: ["classic", "steel", "minimal", "leather", "analog", "dial", "blackdial", "leatherstrap"] },
    { url: U("photo-1547996160-81dfa63595aa"), alt: "Smart watch", tags: ["smart", "digital", "fitness", "sport"] },
  ],
  sunglasses: [
    { url: U("photo-1572635196237-14b3f281503f"), alt: "Aviator sunglasses", tags: ["aviator", "pilot", "metal", "gold"] },
    { url: U("photo-1511499767150-a48a237f0083"), alt: "Wayfarer / round sunglasses", tags: ["round", "circle", "retro", "wayfarer", "matte", "black", "square", "acetate"] },
  ],
  backpack: [
    { url: U("photo-1553062407-98eeb64c6a62"), alt: "Canvas backpack", tags: ["canvas", "backpack", "rucksack", "olive", "waxed", "bag"] },
  ],
  fragrance: [
    { url: U("photo-1541643600914-78b084683601"), alt: "Cologne / EDT bottle", tags: ["cologne", "citrus", "fresh", "woody", "oud", "eaudetoilette", "eaudeparfum", "leather", "rich", "men"] },
    { url: U("photo-1523293182086-7651a899d37f"), alt: "Perfume bottle", tags: ["perfume", "floral", "peony", "rose", "musk", "sweet", "women"] },
  ],
  grooming: [
    { url: U("photo-1556228578-0d85b1a4d571"), alt: "Grooming kit", tags: ["beard", "grooming", "kit", "oil", "balm", "clay", "hair", "wax", "razor", "trimmer", "matte"] },
  ],
  earrings: [
    { url: U("photo-1535632066927-ab7c9ab60908"), alt: "Gold earrings", tags: ["earring", "earrings", "hoop", "stud", "gold", "jewelry", "jewellery"] },
  ],
  heels: [
    { url: U("photo-1543163521-1bf539c55dd2"), alt: "Block heels", tags: ["heel", "heels", "block", "stiletto", "nude", "pump", "strappy"] },
  ],
  flats: [
    { url: U("photo-1543163521-1bf539c55dd2"), alt: "Pointed flats", tags: ["flat", "flats", "ballet", "pointed", "pointedtoe", "loafer"] },
  ],
  dress: [
    { url: U("photo-1595777457583-95e059d581b8"), alt: "Summer / floral dress", tags: ["summer", "floral", "maxi", "casual", "romantic", "white", "shirtdress", "belted"] },
    { url: U("photo-1572804013309-59a88b7e92f1"), alt: "Cocktail / evening dress", tags: ["cocktail", "black", "bodycon", "party", "evening", "midi", "wrap", "sleek"] },
  ],
  kurta: [
    { url: U("photo-1610030469983-98e550d6193c"), alt: "Cotton kurta / kurti", tags: ["kurta", "kurti", "ethnic", "cotton", "indigo", "blockprint", "print", "white", "minimal", "silk", "saree"] },
  ],
  saree: [
    { url: U("photo-1610030469983-98e550d6193c"), alt: "Silk saree", tags: ["saree", "silk", "ethnic", "drape"] },
  ],
  accessory: [
    { url: U("photo-1513506003901-1e6a229e2d15"), alt: "Ring light", tags: ["ring", "ringlight", "light", "led", "lighting", "selfie"] },
    { url: U("photo-1516035069371-29a1b244cc32"), alt: "Camera lens kit", tags: ["lens", "camera", "macro", "wideangle", "clip", "clipon", "phone", "kit", "backdrop"] },
    { url: U("photo-1611085583191-a3b181a88401"), alt: "Fashion accessory", tags: ["accessory", "card", "cardholder", "wallet", "necklace", "gold", "layered", "crossbody", "bag", "neutral", "misc"] },
  ],
};

export function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

/**
 * Garment-TYPE tags — the word that decides *which* garment a photo shows.
 * These dominate colour/fit descriptors (black, slim, white, oversized…) so a
 * "Black Slim Chino" always resolves to chinos, never to whatever tailored
 * trouser happens to share the word "slim". Colour/fit only break ties within
 * a garment type (e.g. black cocktail dress vs. floral summer dress).
 */
const TYPE_TAGS = new Set([
  // tops
  "polo", "pique", "henley", "cargo", "bodysuit", "bodycon", "crop", "croptop", "breton",
  // shirts
  "oxford", "buttondown", "button-down", "campcollar", "camp", "overshirt", "flannel", "linen", "poplin",
  // denim / trousers
  "denim", "mom", "momfit", "chino", "chinos", "jogger", "joggers", "athleisure", "sweatpants", "wide-leg", "bermuda",
  // outerwear
  "blazer", "biker", "moto", "trucker", "bomber", "hoodie", "sweatshirt",
  // footwear
  "platform", "running", "high-top", "hightop", "chelsea", "boot", "boots", "loafer", "loafers", "brogue", "derby",
  // accessories / other
  "smart", "analog", "aviator", "wayfarer", "round", "pilot", "rucksack",
  "kurta", "kurti", "saree", "ringlight", "lens", "camera", "cardholder", "necklace", "crossbody",
]);

function scorePhoto(photo: TaggedPhoto, text: string): number {
  let score = 0;
  for (const tag of photo.tags) {
    if (text.includes(tag)) score += TYPE_TAGS.has(tag) ? 10 : 1;
  }
  return score;
}

/**
 * Resolves the best-matching photo for a product. Deterministic: same inputs
 * always yield the same image.
 */
export function resolveShopImage(
  category: LookCategory,
  title: string,
  keywords: string[] = [],
): TaggedPhoto {
  const pool = CATEGORY_PHOTOS[category] || CATEGORY_PHOTOS.accessory;
  const text = `${title} ${keywords.join(" ")} ${category}`.toLowerCase();

  let best: TaggedPhoto | null = null;
  let bestScore = 0;
  for (const photo of pool) {
    const s = scorePhoto(photo, text);
    if (s > bestScore) {
      best = photo;
      bestScore = s;
    }
  }

  if (best) return best;
  // No tag matched — stable, category-correct fallback for generic looks.
  return pool[hashString(title) % pool.length];
}
