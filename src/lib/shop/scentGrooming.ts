/**
 * Personalises the two shopping categories that have no colour — fragrance and
 * grooming — to the person instead of showing a generic list.
 *
 *  • Fragrance is matched to the person's VIBE/occasion: a bold, premium read
 *    wants warm woody-spicy scents; a clean professional read wants fresh citrus
 *    and aquatic. (A real fragrance-counter rule, not colour.)
 *  • Grooming is matched to the person's ACTUAL detected issue: the report's
 *    grooming/skin "top fix" decides whether we push a mattifying face wash, a
 *    beard oil, a moisturiser, etc.
 */

export interface ScentProfile {
  families: string[]; // single-word scent-family tokens to match against looks
  reason: string; // one genuine line shown on matching fragrance picks
}

export interface GroomingProfile {
  keywords: string[]; // grooming product-type tokens to match against looks
  reason: string; // one genuine line shown on matching grooming picks
}

/** Maps the person's archetype (+ goal) to a flattering scent direction. */
export function scentProfileFor(archetype?: string, goal?: string): ScentProfile {
  const a = (archetype || "").toLowerCase();
  const g = (goal || "").toLowerCase();

  // Warm, magnetic families for bold / premium / dating energy.
  const warm = { families: ["woody", "spicy", "oud", "oriental", "amber", "smoky", "leather"], tone: "warm and magnetic" };
  // Fresh, clean families for professional / everyday energy.
  const fresh = { families: ["citrus", "fresh", "aquatic", "marine", "green", "fruity", "floral"], tone: "clean and fresh" };

  let pick = fresh;
  if (a.includes("flex") || a.includes("bold") || a.includes("premium") || a.includes("luxury") || a.includes("aspiration")) pick = warm;
  if (g === "dating" || g === "confidence") pick = warm; // dates lean warm & close-wearing
  if (a.includes("corporate") || a.includes("sharp") || g === "office" || g === "linkedin" || g === "college") pick = fresh;

  const label = pick === warm ? "warm, woody-spicy" : "fresh, citrus-aquatic";
  return {
    families: pick.families,
    reason: `A ${label} scent suits your ${archetype || "vibe"} — ${pick.tone}.`,
  };
}

/** Maps the person's detected grooming / skin issues to the right products. */
export function groomingProfileFor(
  grooming?: { topFix?: string; assessment?: string; skinClarity?: number; facialHair?: number; hairNeatness?: number },
  skin?: { topFix?: string; notes?: string[] } | null,
): GroomingProfile {
  const text = `${grooming?.topFix ?? ""} ${grooming?.assessment ?? ""} ${skin?.topFix ?? ""} ${(skin?.notes ?? []).join(" ")}`.toLowerCase();
  const kw = new Set<string>();

  if (/shin|oil|matte|greas|t-zone|tzone/.test(text)) { kw.add("face wash"); kw.add("moisturizer"); }
  if (/beard|stubble|facial hair|scruff|patchy/.test(text)) kw.add("beard oil");
  if (/hair|fringe|mess|unkempt|flyaway/.test(text)) kw.add("hair clay");
  if (/dry|dehydr|hydrat|flak|dull|tired/.test(text)) kw.add("moisturizer");
  if (/sun|tan|spf|pigment|\buv\b|dark spot/.test(text)) kw.add("sunscreen");
  if (/clarity|acne|blemish|texture|wash|clean|pore|breakout|even/.test(text)) kw.add("face wash");

  // Sensible default when nothing specific was flagged: a clean base.
  if (kw.size === 0) { kw.add("face wash"); kw.add("moisturizer"); }

  const topFix = grooming?.topFix || skin?.topFix;
  const reason = topFix
    ? `Targets your top grooming fix — ${topFix.replace(/\.$/, "").toLowerCase()}.`
    : "A clean, camera-ready base for your skin.";

  return { keywords: [...kw], reason };
}
