import type { CommerceSearchIntent, WardrobeGap } from "@/types/visualWardrobe";

const INTENT_TEMPLATES: Record<string, CommerceSearchIntent[]> = {
  weak_premium_signal: [
    { query: "black overshirt", categories: ["overshirt", "shirt"], colorTags: ["black", "white"], styleDirection: "premium_minimal", auraLeakTags: ["low_premium_signal"], budgetHint: "mid", priority: 10, reason: "Clean structured layer to elevate premium signal" },
    { query: "white solid t-shirt", categories: ["tshirt"], colorTags: ["white"], styleDirection: "clean_basic", auraLeakTags: ["low_premium_signal"], budgetHint: "budget", priority: 8, reason: "Clean neutral base for any outfit" },
    { query: "minimal watch", categories: ["watch"], colorTags: ["black", "silver"], styleDirection: "premium_minimal", auraLeakTags: ["low_premium_signal"], budgetHint: "mid", priority: 7, reason: "A clean watch signals attention to detail" },
    { query: "clean white sneakers", categories: ["sneakers"], colorTags: ["white"], styleDirection: "clean_basic", auraLeakTags: ["low_premium_signal"], budgetHint: "mid", priority: 6, reason: "White sneakers complete a premium casual look" },
  ],
  weak_dating_warmth: [
    { query: "linen shirt", categories: ["shirt"], colorTags: ["beige", "white", "light blue"], styleDirection: "dating_warm", auraLeakTags: ["dating_warmth_missing"], budgetHint: "mid", priority: 10, reason: "Soft, breathable fabric projects warmth" },
    { query: "solid beige t-shirt", categories: ["tshirt"], colorTags: ["beige", "cream"], styleDirection: "dating_warm", auraLeakTags: ["dating_warmth_missing"], budgetHint: "budget", priority: 8, reason: "Warm neutral tone that feels approachable" },
    { query: "clean sneakers", categories: ["sneakers"], colorTags: ["white", "cream"], styleDirection: "dating_warm", auraLeakTags: ["dating_warmth_missing"], budgetHint: "mid", priority: 7, reason: "Clean footwear completes the warm impression" },
  ],
  weak_professional_signal: [
    { query: "Oxford shirt", categories: ["shirt"], colorTags: ["white", "light blue"], styleDirection: "corporate_sharp", auraLeakTags: ["professional_mismatch"], budgetHint: "mid", priority: 10, reason: "Structured collar shirt for professional settings" },
    { query: "navy chinos", categories: ["chinos", "trousers"], colorTags: ["navy", "charcoal"], styleDirection: "corporate_sharp", auraLeakTags: ["professional_mismatch"], budgetHint: "mid", priority: 8, reason: "Clean tailored trousers in neutral tones" },
    { query: "black belt", categories: ["belt"], colorTags: ["black"], styleDirection: "corporate_sharp", auraLeakTags: ["professional_mismatch"], budgetHint: "budget", priority: 7, reason: "A simple belt ties the professional look together" },
  ],
  weak_creator_energy: [
    { query: "statement overshirt", categories: ["overshirt", "jacket"], colorTags: ["black", "olive"], styleDirection: "creator_bold", auraLeakTags: ["creator_energy_missing"], budgetHint: "mid", priority: 10, reason: "A structured layer adds controlled boldness" },
    { query: "bomber jacket", categories: ["jacket"], colorTags: ["black", "olive"], styleDirection: "creator_bold", auraLeakTags: ["creator_energy_missing"], budgetHint: "premium", priority: 9, reason: "A jacket signals intentional style" },
    { query: "clean sneakers", categories: ["sneakers"], colorTags: ["white"], styleDirection: "creator_bold", auraLeakTags: ["creator_energy_missing"], budgetHint: "mid", priority: 7, reason: "Signature footwear completes the look" },
  ],
  too_plain: [
    { query: "overshirt", categories: ["overshirt", "shirt"], colorTags: ["black", "navy", "olive"], styleDirection: "clean_basic", auraLeakTags: ["too_plain"], budgetHint: "budget", priority: 9, reason: "Adds a structured layer without being loud" },
    { query: "watch", categories: ["watch"], colorTags: ["black", "silver"], styleDirection: "clean_basic", auraLeakTags: ["too_plain"], budgetHint: "budget", priority: 7, reason: "A simple accessory adds visual interest" },
  ],
  too_busy: [
    { query: "solid t-shirt", categories: ["tshirt"], colorTags: ["white", "black", "grey"], styleDirection: "clean_basic", auraLeakTags: ["too_plain"], budgetHint: "budget", priority: 10, reason: "Clean solid base to balance busy colors" },
  ],
  dull_palette: [
    { query: "white t-shirt", categories: ["tshirt"], colorTags: ["white"], styleDirection: "clean_basic", auraLeakTags: ["low_premium_signal"], budgetHint: "budget", priority: 10, reason: "White adds brightness and contrast to a dark palette" },
    { query: "light blue shirt", categories: ["shirt"], colorTags: ["light blue"], styleDirection: "dating_warm", auraLeakTags: ["low_premium_signal"], budgetHint: "budget", priority: 8, reason: "Soft color that lifts the overall palette" },
  ],
  low_contrast: [
    { query: "white overshirt", categories: ["overshirt", "shirt"], colorTags: ["white"], styleDirection: "clean_basic", auraLeakTags: ["low_premium_signal"], budgetHint: "budget", priority: 10, reason: "Light layer adds necessary contrast to dark outfit" },
  ],
  background_outfit_clash: [
    { query: "neutral overshirt", categories: ["overshirt", "shirt"], colorTags: ["white", "beige", "grey"], styleDirection: "clean_basic", auraLeakTags: ["outfit_inconsistency"], budgetHint: "budget", priority: 9, reason: "Neutral layer separates outfit from background" },
  ],
  color_mismatch: [
    { query: "neutral t-shirt", categories: ["tshirt"], colorTags: ["white", "black", "grey"], styleDirection: "clean_basic", auraLeakTags: ["color_mismatch"], budgetHint: "budget", priority: 10, reason: "Neutral base to unify mismatched colors" },
  ],
  college_casual: [
    { query: "solid t-shirt", categories: ["tshirt"], colorTags: ["white", "black"], styleDirection: "college_casual", auraLeakTags: ["too_plain"], budgetHint: "budget", priority: 9, reason: "Essential basic for everyday casual" },
    { query: "dark jeans", categories: ["jeans"], colorTags: ["black", "navy"], styleDirection: "college_casual", auraLeakTags: ["outfit_inconsistency"], budgetHint: "budget", priority: 8, reason: "Versatile bottom for casual outfits" },
  ],
};

export function buildCommerceSearchIntents(gaps: WardrobeGap[], goal?: string): CommerceSearchIntent[] {
  const intents: CommerceSearchIntent[] = [];
  const seenQueries = new Set<string>();

  // Add gap-based intents
  for (const gap of gaps) {
    const templates = INTENT_TEMPLATES[gap.type] || [];
    for (const t of templates) {
      if (!seenQueries.has(t.query)) {
        intents.push({ ...t, priority: t.priority * (gap.auraImpactScore / 50) });
        seenQueries.add(t.query);
      }
    }
  }

  // Add goal-based intents
  if (goal === "dating" || goal === "social") {
    const datingTemplates = INTENT_TEMPLATES.weak_dating_warmth || [];
    for (const t of datingTemplates) {
      if (!seenQueries.has(t.query)) {
        intents.push(t);
        seenQueries.add(t.query);
      }
    }
  }

  if (goal === "office" || goal === "professional") {
    const profTemplates = INTENT_TEMPLATES.weak_professional_signal || [];
    for (const t of profTemplates) {
      if (!seenQueries.has(t.query)) {
        intents.push(t);
        seenQueries.add(t.query);
      }
    }
  }

  return intents.sort((a, b) => b.priority - a.priority).slice(0, 8);
}
