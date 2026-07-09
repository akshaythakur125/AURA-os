/**
 * Look Catalog — combines hero + generated looks and provides
 * filtering/personalization based on audit results.
 *
 * This is the single source of truth for the shopping engine.
 */

import type { Look } from "./catalogTypes";
import type { StyleIntent } from "@/types/personalization";
import type { StatusLeakTag, GoalTag, BudgetTag } from "@/types/product";
import { HERO_LOOKS } from "./heroLooks";
import { generateLongTailLooks } from "./generatedLooks";

// Singleton cache for generated looks
let _generatedCache: Look[] | null = null;

function getGeneratedLooks(): Look[] {
  if (!_generatedCache) {
    _generatedCache = generateLongTailLooks();
  }
  return _generatedCache;
}

/**
 * Returns the complete look catalog (hero + generated).
 */
export function getAllLooks(): Look[] {
  return [...HERO_LOOKS, ...getGeneratedLooks()];
}

/**
 * Returns only hero (hand-curated) looks.
 */
export function getHeroLooks(): Look[] {
  return HERO_LOOKS;
}

/**
 * Returns total look count with hero/generated breakdown.
 */
export function getCatalogStats(): {
  total: number;
  hero: number;
  generated: number;
} {
  const generated = getGeneratedLooks();
  return {
    total: HERO_LOOKS.length + generated.length,
    hero: HERO_LOOKS.length,
    generated: generated.length,
  };
}

/**
 * Score a look's relevance to a user's audit result.
 * Higher score = more relevant.
 */
function scoreLook(
  look: Look,
  params: {
    styleArchetypes?: StyleIntent[];
    statusLeakTags?: StatusLeakTag[];
    goalTags?: GoalTag[];
    budgetMax?: BudgetTag;
  }
): number {
  let score = 0;

  // Style archetype match (high weight)
  if (params.styleArchetypes) {
    for (const arch of params.styleArchetypes) {
      if (look.styleArchetypes.includes(arch)) {
        score += 35;
      }
    }
  }

  // Status leak match (highest weight — this is what they need fixed)
  if (params.statusLeakTags) {
    for (const leak of params.statusLeakTags) {
      if (look.statusLeakTags.includes(leak)) {
        score += 40;
      }
    }
  }

  // Goal match (medium weight)
  if (params.goalTags) {
    for (const goal of params.goalTags) {
      if (look.goalTags.includes(goal)) {
        score += 20;
      }
    }
  }

  // Budget match (penalty if over budget)
  if (params.budgetMax !== undefined) {
    const maxBudget = params.budgetMax;
    if (look.price > maxBudget) {
      // Look is over budget — significant penalty
      score -= 50;
    } else {
      // Under budget — small bonus for affordability
      score += 10;
    }
  }

  // Base priority contribution (up to 10 points)
  score += (look.priorityScore / 100) * 10;

  return score;
}

export interface PersonalizationParams {
  styleArchetypes?: StyleIntent[];
  statusLeakTags?: StatusLeakTag[];
  goalTags?: GoalTag[];
  budgetMax?: BudgetTag;
  gender?: "men" | "women" | "unisex";
  limit?: number;
}

/**
 * Returns personalized look recommendations based on audit results.
 * Two different inputs should visibly produce two different sets of looks.
 */
export function getPersonalizedLooks(params: PersonalizationParams): Look[] {
  const allLooks = getAllLooks();

  // Filter by gender if specified
  let filtered = allLooks;
  if (params.gender) {
    filtered = allLooks.filter(
      (look) => look.gender === params.gender || look.gender === "unisex"
    );
  }

  // Score each look
  const scored = filtered.map((look) => ({
    look,
    score: scoreLook(look, params),
  }));

  // Sort by score descending
  scored.sort((a, b) => b.score - a.score);

  // Return top N (default 20)
  const limit = params.limit || 20;
  return scored.slice(0, limit).map((s) => s.look);
}

/**
 * Returns a default recommendation set when no audit result is available.
 * Shows a balanced mix across categories and genders.
 */
export function getDefaultLooks(limit: number = 16): Look[] {
  const hero = getHeroLooks();
  // Shuffle hero looks and return a mix
  const shuffled = [...hero].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, limit);
}
