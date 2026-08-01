/**
 * The Style Passport — the single highest-value ₹21 payload.
 *
 * A person prepping how they look normally bounces across half a dozen sites:
 * one to find their face shape's haircuts, another for "which glasses suit an
 * oval face", a colour-analysis quiz for their undertone, a neckline guide, a
 * fragrance quiz, a grooming article. Every one of those answers is already
 * computed inside our scan. This module consolidates them into ONE portable
 * spec the user keeps and pulls up every time they shop, book a salon, or buy
 * glasses — which is exactly what turns a one-time report into a repeat habit.
 *
 * Pure and deterministic — no API, works off the free scan.
 */

export type FaceShape = "oval" | "round" | "square" | "oblong" | "heart" | "diamond";
export type Undertone = "warm" | "cool" | "neutral";

export interface StylePassportInput {
  faceShape?: FaceShape;
  undertone?: Undertone;
  undertoneConfident?: boolean;
  paletteName?: string;
  powerColors?: string[];
  avoidColors?: string[];
  archetype?: string;
  detectedStyle?: string;
  scentFamilies?: string[];
  scentReason?: string;
  groomingFocus?: string;
  goal?: string;
}

export interface FaceRecs {
  haircuts: string[];
  glasses: string[];
  necklines: string[];
  beard: string[];
  avoid: string;
}

export interface StylePassportData {
  faceShape?: FaceShape;
  face?: FaceRecs;
  undertone?: Undertone;
  undertoneConfident: boolean;
  paletteName?: string;
  powerColors: string[];
  avoidColors: string[];
  metals: string[];
  frameColors: string[];
  archetype?: string;
  detectedStyle?: string;
  scent?: { label: string; note: string };
  groomingFocus?: string;
  headline: string;
}

// Face-shape rules — haircut/glasses/beard mirror the Face-Shape Studio; necklines
// are the real menswear rule (balance length vs width, soften or lengthen the jaw).
const FACE: Record<FaceShape, FaceRecs> = {
  oval: {
    haircuts: ["Textured crop", "Side part", "Quiff", "Medium length"],
    glasses: ["Rectangular", "Square", "Wayfarer"],
    necklines: ["Crew", "V-neck", "Henley", "Polo"],
    beard: ["Light–medium stubble", "Balanced short beard"],
    avoid: "Too much height on top — it lengthens an already balanced face.",
  },
  round: {
    haircuts: ["Pompadour", "High fade", "Quiff with volume", "Short sides"],
    glasses: ["Rectangular", "Angular", "Wayfarer"],
    necklines: ["V-neck", "Deep scoop", "Open collar"],
    beard: ["Fuller on the chin", "Short on the sides"],
    avoid: "Round frames, crew necks and buzz cuts — they emphasise roundness.",
  },
  square: {
    haircuts: ["Textured crop", "Side part", "Medium swept back"],
    glasses: ["Round", "Oval", "Rimless"],
    necklines: ["Crew", "Boat", "Rounded / soft necklines"],
    beard: ["Rounded short beard", "Trimmed boxed beard"],
    avoid: "Very boxy frames and deep V-necks — they over-square a strong jaw.",
  },
  oblong: {
    haircuts: ["Fringe / forward styles", "Medium sides", "Low fade"],
    glasses: ["Wide / oversized", "Decorative temples"],
    necklines: ["Crew", "Turtleneck", "Boat / horizontal stripes"],
    beard: ["Fuller on the sides", "Keep chin trimmed"],
    avoid: "Tall styles, long goatees and deep V-necks — they add length.",
  },
  heart: {
    haircuts: ["Medium length", "Side-swept fringe", "Textured, low volume"],
    glasses: ["Bottom-heavy", "Round", "Light rimless"],
    necklines: ["Boat", "Crew", "Scoop"],
    beard: ["Fuller beard to add chin width"],
    avoid: "Heavy volume up top and deep V-necks — they widen the forehead.",
  },
  diamond: {
    haircuts: ["Fringe", "Longer on top", "Textured"],
    glasses: ["Oval", "Rimless", "Soft cat-eye"],
    necklines: ["Crew", "Scoop", "V-neck"],
    beard: ["Fuller chin", "Light cheek line"],
    avoid: "Slicked-back styles that expose prominent cheekbones fully.",
  },
};

// Metals + frame colours by undertone — the optician/jeweller rule: warm colouring
// glows in gold & tortoiseshell, cool colouring in silver & black.
const METALS: Record<Undertone, string[]> = {
  warm: ["Gold", "Rose gold", "Bronze", "Brass"],
  cool: ["Silver", "White gold", "Platinum", "Gunmetal"],
  neutral: ["Gold", "Silver", "Rose gold"],
};
const FRAMES: Record<Undertone, string[]> = {
  warm: ["Gold", "Tortoiseshell", "Brown", "Honey"],
  cool: ["Silver", "Black", "Navy", "Cool grey"],
  neutral: ["Tortoiseshell", "Black", "Brown", "Rose gold"],
};

function scentLabel(families?: string[]): string | undefined {
  if (!families || families.length === 0) return undefined;
  const set = new Set(families.map((f) => f.toLowerCase()));
  if (set.has("woody") || set.has("oud") || set.has("spicy") || set.has("amber") || set.has("leather")) return "Warm woody-spicy";
  if (set.has("citrus") || set.has("aquatic") || set.has("fresh") || set.has("marine") || set.has("green")) return "Fresh citrus-aquatic";
  if (set.has("floral") || set.has("fruity")) return "Bright floral-fruity";
  return families[0].charAt(0).toUpperCase() + families[0].slice(1);
}

export function buildStylePassport(input: StylePassportInput): StylePassportData {
  const undertone = input.undertone;
  const undertoneConfident = input.undertoneConfident !== false;
  const face = input.faceShape ? FACE[input.faceShape] : undefined;

  const label = scentLabel(input.scentFamilies);
  const scent = label ? { label, note: input.scentReason || "Matched to your vibe — wears close and suits you." } : undefined;

  const bits: string[] = [];
  if (input.faceShape) bits.push(`${input.faceShape.charAt(0).toUpperCase() + input.faceShape.slice(1)} face`);
  if (undertone) bits.push(`${undertone.charAt(0).toUpperCase() + undertone.slice(1)}${undertoneConfident ? "" : "-leaning"} undertone`);
  if (input.archetype) bits.push(input.archetype);
  const headline = bits.join(" · ") || "Your personal style spec";

  return {
    faceShape: input.faceShape,
    face,
    undertone,
    undertoneConfident,
    paletteName: input.paletteName,
    powerColors: (input.powerColors || []).slice(0, 6),
    avoidColors: undertoneConfident ? (input.avoidColors || []).slice(0, 4) : [],
    metals: undertone ? METALS[undertone] : [],
    frameColors: undertone ? FRAMES[undertone] : [],
    archetype: input.archetype,
    detectedStyle: input.detectedStyle,
    scent,
    groomingFocus: input.groomingFocus,
    headline,
  };
}
