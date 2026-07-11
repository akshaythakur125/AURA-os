/**
 * Color Palette Engine
 * Given undertone + skin depth + occasion, recommend specific color palettes.
 * Each palette is a set of colors that are known to complement the given profile.
 */

import type { Undertone, SkinDepth } from "./undertoneEngine";

export interface ColorPalette {
  name: string;
  colors: string[];
  occasion: string;
  avoid: string[];
  reasoning: string;
}

const PALETTES: Record<Undertone, Record<string, ColorPalette>> = {
  warm: {
    dating: {
      name: "Warm Romantic",
      colors: ["burnt orange", "olive green", "warm red", "camel", "cream", "terracotta", "rust", "mustard"],
      occasion: "dating",
      avoid: ["neon pink", "electric blue", "pure white", "silver"],
      reasoning: "Warm tones complement golden undertones. Earthy colors create a natural, inviting feel.",
    },
    instagram: {
      name: "Warm Aesthetic",
      colors: ["rust", "olive", "camel", "terracotta", "burnt sienna", "forest green", "warm brown"],
      occasion: "instagram",
      avoid: ["cool grey", "icy blue", "lavender", "silver"],
      reasoning: "Consistent warm palette creates a cohesive feed. These colors photograph well in natural light.",
    },
    professional: {
      name: "Warm Professional",
      colors: ["navy", "camel", "olive", "brown", "cream", "burgundy", "forest green"],
      occasion: "professional",
      avoid: ["black", "neon colors", "pastel pink", "bright yellow"],
      reasoning: "Warm neutrals project approachable professionalism. Avoids the coldness of pure black/grey.",
    },
    festival: {
      name: "Festive Warmth",
      colors: ["marigold", "vermillion", "emerald", "gold", "rust", "deep red", "ivory"],
      occasion: "festival",
      avoid: ["neon", "pastel blue", "silver", "white"],
      reasoning: "Bold warm tones match festive energy. Gold and marigold are traditional and photogenic.",
    },
    default: {
      name: "Everyday Warm",
      colors: ["olive", "camel", "rust", "cream", "brown", "warm grey", "terracotta"],
      occasion: "everyday",
      avoid: ["pure white", "neon", "icy blue", "silver"],
      reasoning: "Versatile warm palette that works across contexts. Easy to mix and match.",
    },
  },
  cool: {
    dating: {
      name: "Cool Romantic",
      colors: ["dusty rose", "navy", "plum", "soft white", "slate blue", "lavender", "charcoal"],
      occasion: "dating",
      avoid: ["orange", "mustard", "warm red", "brown"],
      reasoning: "Cool tones complement rosy undertones. Muted colors create a sophisticated, approachable feel.",
    },
    instagram: {
      name: "Cool Aesthetic",
      colors: ["slate blue", "lavender", "dusty rose", "charcoal", "soft white", "plum", "silver grey"],
      occasion: "instagram",
      avoid: ["orange", "rust", "mustard", "warm brown"],
      reasoning: "Cool-toned palette creates a clean, modern aesthetic. Consistent and photogenic.",
    },
    professional: {
      name: "Cool Professional",
      colors: ["charcoal", "slate blue", "navy", "soft white", "grey", "black", "light blue"],
      occasion: "professional",
      avoid: ["orange", "warm red", "mustard", "brown"],
      reasoning: "Cool neutrals project sharp professionalism. Classic and safe for corporate settings.",
    },
    festival: {
      name: "Festive Cool",
      colors: ["royal blue", "silver", "emerald", "magenta", "purple", "deep red", "white"],
      occasion: "festival",
      avoid: ["orange", "mustard", "warm yellow", "brown"],
      reasoning: "Bold cool tones stand out in festive settings. Jewel tones are universally flattering on cool skin.",
    },
    default: {
      name: "Everyday Cool",
      colors: ["navy", "grey", "charcoal", "light blue", "soft white", "slate", "plum"],
      occasion: "everyday",
      avoid: ["orange", "rust", "warm yellow", "brown"],
      reasoning: "Versatile cool palette. Easy to build a wardrobe around these core colors.",
    },
  },
  neutral: {
    dating: {
      name: "Versatile Romantic",
      colors: ["white", "navy", "grey", "olive", "soft pink", "cream", "dusty blue"],
      occasion: "dating",
      avoid: ["neon", "very bright orange", "electric blue"],
      reasoning: "Neutral undertones can wear almost anything. Stick to muted tones for a natural look.",
    },
    instagram: {
      name: "Versatile Aesthetic",
      colors: ["white", "black", "grey", "olive", "navy", "cream", "dusty tones"],
      occasion: "instagram",
      avoid: ["neon", "very saturated colors"],
      reasoning: "Neutral palette offers maximum flexibility. Black and white always work.",
    },
    professional: {
      name: "Versatile Professional",
      colors: ["black", "white", "navy", "grey", "cream", "charcoal"],
      occasion: "professional",
      avoid: ["neon", "very bright colors"],
      reasoning: "Classic professional palette. Safe and sharp for any corporate context.",
    },
    festival: {
      name: "Festive Versatile",
      colors: ["red", "gold", "emerald", "white", "royal blue", "black"],
      occasion: "festival",
      avoid: ["neon", "very muted pastels"],
      reasoning: "Neutral skin can pull off bold colors. Go bright for festivals.",
    },
    default: {
      name: "Everyday Neutral",
      colors: ["black", "white", "grey", "navy", "olive", "cream", "brown"],
      occasion: "everyday",
      avoid: ["neon"],
      reasoning: "Maximum versatility. Build around these basics.",
    },
  },
};

/**
 * Get color palette recommendations based on undertone and occasion.
 */
export function getColorPalette(
  undertone: Undertone,
  skinDepth: SkinDepth,
  occasion: string
): ColorPalette {
  const occasionKey = occasion in PALETTES[undertone] ? occasion : "default";
  const base = PALETTES[undertone][occasionKey] || PALETTES[undertone].default;

  // Adjust for skin depth: lighter skin can handle darker colors, darker skin pops with lighter colors
  const adjusted = { ...base };
  if (skinDepth === "fair" || skinDepth === "light") {
    adjusted.colors = [...adjusted.colors, "burgundy", "forest green", "navy"];
  } else if (skinDepth === "dark" || skinDepth === "deep") {
    adjusted.colors = [...adjusted.colors, "white", "cream", "gold", "coral", "bright blue"];
  }

  return adjusted;
}
