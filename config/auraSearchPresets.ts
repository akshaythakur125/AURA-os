import type { AuraLeakTag, AuraStyleDirection, WardrobeCategory } from "@/types/commerce";

export interface AuraSearchPreset {
  id: string;
  label: string;
  description: string;
  auraLeakTags: AuraLeakTag[];
  styleDirection: AuraStyleDirection;
  recommendedCategories: WardrobeCategory[];
  avoidCategories: WardrobeCategory[];
  budgetMax?: number;
  goal?: string;
}

export const AURA_SEARCH_PRESETS: AuraSearchPreset[] = [
  {
    id: "dating_warm_fix",
    label: "Dating Profile Fix",
    description: "Soft, warm, and approachable outfits for better dating profile photos",
    auraLeakTags: ["dating_warmth_missing", "weak_lighting", "busy_background"],
    styleDirection: "dating_warm",
    recommendedCategories: ["shirt", "tshirt", "overshirt", "sneakers", "watch"],
    avoidCategories: ["hoodie", "sunglasses", "kurta"],
    budgetMax: 5000,
    goal: "dating",
  },
  {
    id: "college_casual_upgrade",
    label: "College Casual Upgrade",
    description: "Effortless everyday style — tees, overshirts, and clean sneakers",
    auraLeakTags: ["too_plain", "outfit_inconsistency", "low_premium_signal"],
    styleDirection: "college_casual",
    recommendedCategories: ["tshirt", "overshirt", "sneakers", "hoodie", "watch"],
    avoidCategories: ["formal_shoes", "kurta", "perfume"],
    budgetMax: 3000,
    goal: "college",
  },
  {
    id: "corporate_sharp_look",
    label: "Corporate Sharp Look",
    description: "Polished office style — oxford shirts, chinos, and leather belts",
    auraLeakTags: ["professional_mismatch", "low_premium_signal", "color_mismatch"],
    styleDirection: "corporate_sharp",
    recommendedCategories: ["shirt", "trousers", "chinos", "belt", "formal_shoes", "watch"],
    avoidCategories: ["hoodie", "sneakers", "tshirt", "kurta"],
    budgetMax: 10000,
    goal: "office",
  },
  {
    id: "creator_bold_statement",
    label: "Creator Bold Statement",
    description: "Distinctive, attention-grabbing outfits for content creators",
    auraLeakTags: ["creator_energy_missing", "too_plain", "over_flex"],
    styleDirection: "creator_bold",
    recommendedCategories: ["jacket", "overshirt", "sunglasses", "watch", "sneakers"],
    avoidCategories: ["tshirt", "formal_shoes", "belt"],
    budgetMax: 15000,
    goal: "creator",
  },
  {
    id: "premium_minimal_cleanup",
    label: "Premium Minimal Cleanup",
    description: "Clean, understated pieces that signal premium taste",
    auraLeakTags: ["low_premium_signal", "too_plain", "color_mismatch"],
    styleDirection: "premium_minimal",
    recommendedCategories: ["shirt", "watch", "belt", "sneakers", "trousers", "wallet"],
    avoidCategories: ["hoodie", "kurta", "jewellery"],
    budgetMax: 8000,
    goal: "casual",
  },
  {
    id: "photo_quality_fix",
    label: "Photo Quality Fix",
    description: "Items that improve your photo setup — not clothing, but visual quality",
    auraLeakTags: ["weak_lighting", "weak_clarity", "weak_framing", "busy_background"],
    styleDirection: "clean_basic",
    recommendedCategories: ["background_item", "photo_accessory"],
    avoidCategories: [],
    budgetMax: 3000,
  },
  {
    id: "street_smart_edge",
    label: "Street Smart Edge",
    description: "Urban edgy looks with sneakers, jackets, and attitude",
    auraLeakTags: ["too_plain", "outfit_inconsistency"],
    styleDirection: "street_smart",
    recommendedCategories: ["jacket", "sneakers", "hoodie", "overshirt", "sunglasses"],
    avoidCategories: ["formal_shoes", "kurta", "trousers"],
    budgetMax: 7000,
    goal: "casual",
  },
  {
    id: "ethnic_clean_festival",
    label: "Ethnic Clean Festival",
    description: "Clean kurta sets for Indian festivals and events",
    auraLeakTags: ["outfit_inconsistency", "color_mismatch", "low_premium_signal"],
    styleDirection: "ethnic_clean",
    recommendedCategories: ["kurta", "sneakers", "watch", "wallet"],
    avoidCategories: ["hoodie", "tshirt", "formal_shoes"],
    budgetMax: 5000,
    goal: "casual",
  },
];
