import type { AuraLeakTag, AuraStyleDirection, WardrobeCategory } from "@/types/commerce";

export interface OutfitRule {
  leak: AuraLeakTag;
  description: string;
  recommendedDirections: AuraStyleDirection[];
  recommendedCategories: WardrobeCategory[];
  avoidCategories: WardrobeCategory[];
  colorPalette: string[];
  principle: string;
  explanation: string;
}

const OUTfit_RULES: OutfitRule[] = [
  {
    leak: "weak_lighting",
    description: "Your photo has poor lighting — too dark, shadowed, or unevenly lit.",
    recommendedDirections: ["clean_basic"],
    recommendedCategories: ["photo_accessory", "background_item", "tshirt"],
    avoidCategories: ["jacket", "kurta", "watch", "sunglasses"],
    colorPalette: ["white", "cream", "light grey"],
    principle: "Fix your light first, then your clothes.",
    explanation: "No outfit upgrade matters if the photo is too dark to see. Invest in a ring light or tripod before buying new clothes. Meanwhile, wear light colors that reflect available light.",
  },
  {
    leak: "busy_background",
    description: "Your photo background is cluttered with objects, people, or visual noise.",
    recommendedDirections: ["clean_basic", "premium_minimal"],
    recommendedCategories: ["background_item", "tshirt", "shirt", "overshirt"],
    avoidCategories: ["kurta", "jacket", "sunglasses"],
    colorPalette: ["white", "black", "grey", "navy"],
    principle: "Clean background + clean outfit = clear signal.",
    explanation: "A busy background distracts from your face. Use a neutral cloth or find a clean wall. Keep your outfit simple so you don't add to the visual noise.",
  },
  {
    leak: "weak_clarity",
    description: "Your photo is blurry, low-resolution, or pixelated.",
    recommendedDirections: ["clean_basic", "premium_minimal"],
    recommendedCategories: ["photo_accessory", "grooming"],
    avoidCategories: ["jacket", "kurta", "hoodie"],
    colorPalette: ["white", "cream", "navy"],
    principle: "Clarity before couture.",
    explanation: "A blurry photo makes every outfit look worse. Clean your lens, use a tripod, and ensure good lighting. High-impact items: lens cloth, tripod, ring light.",
  },
  {
    leak: "weak_framing",
    description: "Your photo is poorly cropped or framed — too close, too far, or awkward angle.",
    recommendedDirections: ["clean_basic", "premium_minimal"],
    recommendedCategories: ["photo_accessory", "tshirt", "shirt"],
    avoidCategories: ["jacket", "hoodie", "sunglasses"],
    colorPalette: ["white", "navy", "black"],
    principle: "Frame yourself intentionally.",
    explanation: "Poor framing distracts from your face. Use a tripod to frame consistently. Wear structured tops (shirts, overshirts) that define your silhouette within the frame.",
  },
  {
    leak: "outfit_inconsistency",
    description: "Your clothing items don't visually match — different styles, colors, or formality levels.",
    recommendedDirections: ["clean_basic", "college_casual", "premium_minimal"],
    recommendedCategories: ["tshirt", "jeans", "sneakers", "overshirt", "chinos"],
    avoidCategories: ["kurta", "formal_shoes", "jacket"],
    colorPalette: ["navy", "white", "beige", "grey"],
    principle: "Match formality and color palette across all items.",
    explanation: "Inconsistency signals lack of style awareness. Start with a simple uniform: solid tee, dark jeans, clean sneakers. Add one layer (overshirt) for structure.",
  },
  {
    leak: "low_premium_signal",
    description: "Your outfit looks lower quality than it might actually be — faded, wrinkled, ill-fitting, or worn out.",
    recommendedDirections: ["premium_minimal", "soft_luxury", "understated_confident"],
    recommendedCategories: ["watch", "belt", "chinos", "shirt", "overshirt", "sneakers"],
    avoidCategories: ["hoodie", "tshirt", "jeans"],
    colorPalette: ["black", "white", "beige", "navy", "grey"],
    principle: "Fit, fabric, and finish matter more than brand.",
    explanation: "Premium signal comes from intentional choices. A well-fitted shirt with a watch and clean sneakers signals quality. Remove faded, pilled, or ill-fitting items first.",
  },
  {
    leak: "over_flex",
    description: "Your outfit tries too hard — multiple logos, flashy accessories, or status-signaling items stacked together.",
    recommendedDirections: ["understated_confident", "clean_basic", "premium_minimal", "college_casual"],
    recommendedCategories: ["tshirt", "chinos", "belt", "watch", "sneakers"],
    avoidCategories: ["jacket", "sunglasses", "hoodie"],
    colorPalette: ["white", "navy", "black", "grey"],
    principle: "One intentional piece is stronger than three loud ones.",
    explanation: "Over-flexing signals insecurity. Remove one visible status item. Let one piece (watch, sneakers, or jacket) be the statement while everything else is clean and minimal.",
  },
  {
    leak: "too_plain",
    description: "Your outfit is so basic it looks like you didn't try at all.",
    recommendedDirections: ["premium_minimal", "urban_aspirational", "college_casual"],
    recommendedCategories: ["overshirt", "watch", "belt", "sneakers", "shirt"],
    avoidCategories: ["hoodie", "kurta"],
    colorPalette: ["white", "navy", "olive", "beige"],
    principle: "Add one intentional piece to signal effort.",
    explanation: "Too-plain outfits are missing a single intentional piece. Add an overshirt, a watch, or swap sneakers from black to white. One change can shift the whole look.",
  },
  {
    leak: "color_mismatch",
    description: "Your outfit colors clash or don't work together harmoniously.",
    recommendedDirections: ["clean_basic", "premium_minimal", "corporate_sharp"],
    recommendedCategories: ["tshirt", "chinos", "belt", "sneakers", "shirt"],
    avoidCategories: ["jacket", "hoodie", "kurta"],
    colorPalette: ["white", "navy", "beige", "grey", "black"],
    principle: "Stick to a 2-color palette until you understand color theory.",
    explanation: "Color mismatch is the most common outfit error. Use neutrals (white, grey, navy, black, beige) as your base. Add only one accent color. Match metal tones (silver/silver or gold/gold).",
  },
  {
    leak: "weak_profile_order",
    description: "Your dating/profile photos are not in optimal order — weaker photos first, stronger ones buried.",
    recommendedDirections: ["dating_warm", "clean_basic", "premium_minimal"],
    recommendedCategories: ["tshirt", "shirt", "sneakers", "watch"],
    avoidCategories: ["jacket", "hoodie", "sunglasses"],
    colorPalette: ["white", "navy", "beige", "cream"],
    principle: "Lead with your best visual signal.",
    explanation: "Your first profile photo should be the highest-quality version of you. Good lighting, clean outfit, clear face. The items here will help you get that first photo right.",
  },
  {
    leak: "professional_mismatch",
    description: "Your outfit doesn't match the professional context you're in or targeting.",
    recommendedDirections: ["corporate_sharp", "clean_basic", "understated_confident"],
    recommendedCategories: ["shirt", "trousers", "chinos", "belt", "formal_shoes", "watch"],
    avoidCategories: ["hoodie", "sneakers", "jeans", "tshirt"],
    colorPalette: ["white", "navy", "grey", "black"],
    principle: "Dress for the role you want, not the role you have.",
    explanation: "Professional mismatch signals lower status in that context. An Oxford shirt, tailored trousers, belt, and formal shoes instantly shift perception. Keep accessories minimal.",
  },
  {
    leak: "dating_warmth_missing",
    description: "Your outfit or photo feels cold, unapproachable, or too aggressive for dating contexts.",
    recommendedDirections: ["dating_warm", "clean_basic", "soft_luxury"],
    recommendedCategories: ["shirt", "tshirt", "chinos", "watch", "belt", "perfume"],
    avoidCategories: ["jacket", "hoodie", "sunglasses"],
    colorPalette: ["cream", "beige", "white", "navy", "olive"],
    principle: "Warmth signals safety and approachability.",
    explanation: "Dating warmth comes from soft textures, warm colors, and open body language in photos. A linen shirt or cream tee in natural light creates approachability. Avoid black-on-black.",
  },
  {
    leak: "creator_energy_missing",
    description: "Your outfit lacks personality or creative energy for content/creator contexts.",
    recommendedDirections: ["creator_bold", "urban_aspirational", "street_smart"],
    recommendedCategories: ["overshirt", "jacket", "sneakers", "sunglasses", "tshirt"],
    avoidCategories: ["formal_shoes", "trousers", "shirt"],
    colorPalette: ["black", "white", "olive", "burgundy"],
    principle: "Creator energy comes from intentional contrast and texture.",
    explanation: "Creator outfits should have one bold element balanced by neutrals. An overshirt layered over a graphic tee with clean sneakers signals creative confidence without trying too hard.",
  },
];

export function getRuleForLeak(leak: AuraLeakTag): OutfitRule | undefined {
  return OUTfit_RULES.find((r) => r.leak === leak);
}

export function getAllRules(): OutfitRule[] {
  return OUTfit_RULES;
}
