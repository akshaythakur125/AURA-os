/**
 * Capsule checklist — the exact set of wardrobe essentials to OWN, each assigned
 * a real colour from the person's palette (or an undertone-safe neutral), turned
 * into a buyable, tickable list. A capsule is the highest-leverage wardrobe
 * concept: ~10 pieces that mix into a month of outfits. This makes it a shopping
 * plan, not inspiration.
 *
 * ACCURACY-SAFE: every item resolves to a retailer SEARCH query built from a
 * real colour + garment + gender — never a fixed product image — so the listing
 * shows the correct current product. Pure/deterministic, no key.
 */

export type Undertone = "warm" | "cool" | "neutral";

export interface CapsuleItem {
  id: string;
  slot: string;      // "Base tee", "Statement shirt", …
  item: string;      // human label, e.g. "Olive crew tee"
  colour: string;
  query: string;     // retailer search query
  why: string;
}

export interface CapsuleChecklistInput {
  powerColors?: string[];
  undertone?: Undertone;
  gender?: "men" | "women" | "unisex";
}

const NEUTRALS: Record<Undertone, { light: string; dark: string; base: string; denim: string }> = {
  warm: { light: "cream", dark: "chocolate brown", base: "olive", denim: "indigo" },
  cool: { light: "white", dark: "charcoal", base: "navy", denim: "dark wash" },
  neutral: { light: "white", dark: "charcoal", base: "navy", denim: "dark wash" },
};

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function buildCapsuleChecklist(input: CapsuleChecklistInput): CapsuleItem[] {
  const undertone = input.undertone || "neutral";
  const n = NEUTRALS[undertone];
  const gWord = input.gender === "men" ? " men" : input.gender === "women" ? " women" : "";
  const powers = (input.powerColors || []).map((c) => c.toLowerCase());
  const p1 = powers[0] || n.base;
  const p2 = powers[1] || n.base;
  const metal = undertone === "cool" ? "silver" : "gold";
  const frame = undertone === "cool" ? "black" : "tortoiseshell";

  // A real 10-piece capsule: 3 tops, 2 bottoms, a layer, 2 footwear, 2 finishing.
  const items: CapsuleItem[] = [
    { id: "tee-neutral", slot: "Base tee", item: `${cap(n.light)} crew tee`, colour: n.light, query: `${n.light} crew neck t-shirt${gWord}`, why: "The blank canvas — goes under everything." },
    { id: "tee-power", slot: "Colour tee", item: `${cap(p1)} tee`, colour: p1, query: `${p1} t-shirt${gWord}`, why: `${cap(p1)} is one of your power colours — instant lift near your face.` },
    { id: "shirt", slot: "Statement shirt", item: `${cap(p2)} shirt`, colour: p2, query: `${p2} slim fit shirt${gWord}`, why: "Dress it up or leave it open over the tee." },
    { id: "denim", slot: "Everyday bottom", item: `${cap(n.denim)} jeans`, colour: n.denim, query: `${n.denim} slim jeans${gWord}`, why: "The workhorse — pairs with all three tops." },
    { id: "trouser", slot: "Smart bottom", item: `${cap(n.dark)} trousers`, colour: n.dark, query: `${n.dark} tapered trousers${gWord}`, why: "Takes the capsule from casual to sharp in one swap." },
    { id: "layer", slot: "Layer", item: `${cap(n.base)} overshirt / jacket`, colour: n.base, query: `${n.base} overshirt jacket${gWord}`, why: "The piece that makes an outfit look considered." },
    { id: "sneakers", slot: "Clean footwear", item: "White sneakers", colour: "white", query: `white sneakers${gWord}`, why: "The one shoe that works with the whole capsule." },
    { id: "shoes", slot: "Smart footwear", item: `${cap(n.dark)} shoes / boots`, colour: n.dark, query: `${n.dark} chelsea boots${gWord}`, why: "For the smart-bottom days." },
    { id: "watch", slot: "Wrist", item: `${cap(metal)}-tone watch`, colour: metal, query: `${metal} tone watch${gWord}`, why: `${cap(metal)} matches your ${undertone} undertone.` },
    { id: "shades", slot: "Face", item: `${cap(frame)} sunglasses`, colour: frame, query: `${frame} sunglasses${gWord}`, why: `${cap(frame)} frames flatter your colouring.` },
  ];

  return items;
}
