/**
 * Look Catalog - combines hero + generated looks and provides
 * filtering/personalization based on audit results.
 *
 * This is the single source of truth for the shopping engine.
 */

import type { Look } from "./catalogTypes";
import type { StyleIntent } from "@/types/personalization";
import type { StatusLeakTag, GoalTag, BudgetTag } from "@/types/product";
import { HERO_LOOKS } from "./heroLooks";
import { generateLongTailLooks } from "./generatedLooks";
import { getLookTotalPrice, hasLookComposition } from "./lookCompositions";

let _generatedCache: Look[] | null = null;

function getGeneratedLooks(): Look[] {
  if (!_generatedCache) {
    _generatedCache = generateLongTailLooks();
  }
  return _generatedCache;
}

export function getAllLooks(): Look[] {
  return [...HERO_LOOKS, ...getGeneratedLooks()];
}

export function getHeroLooks(): Look[] {
  return HERO_LOOKS;
}

export function getShoppableLooks(): Look[] {
  return HERO_LOOKS.filter((look) => hasLookComposition(look.id));
}

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

  if (params.styleArchetypes) {
    for (const arch of params.styleArchetypes) {
      if (look.styleArchetypes.includes(arch)) {
        score += 35;
      }
    }
  }

  if (params.statusLeakTags) {
    for (const leak of params.statusLeakTags) {
      if (look.statusLeakTags.includes(leak)) {
        score += 40;
      }
    }
  }

  if (params.goalTags) {
    for (const goal of params.goalTags) {
      if (look.goalTags.includes(goal)) {
        score += 20;
      }
    }
  }

  if (params.budgetMax !== undefined) {
    const lookPrice = getLookTotalPrice(look);
    if (lookPrice > params.budgetMax) {
      score -= 50;
    } else {
      score += 10;
    }
  }

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

export function getPersonalizedLooks(params: PersonalizationParams): Look[] {
  const allLooks = getShoppableLooks();

  let filtered = allLooks;
  if (params.gender) {
    filtered = allLooks.filter(
      (look) => look.gender === params.gender || look.gender === "unisex"
    );
  }

  const scored = filtered.map((look) => ({
    look,
    score: scoreLook(look, params),
  }));

  scored.sort((a, b) => b.score - a.score);

  const limit = params.limit || 20;
  return scored.slice(0, limit).map((item) => item.look);
}

export function getDefaultLooks(limit: number = 16): Look[] {
  const hero = getShoppableLooks();
  const shuffled = [...hero].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, limit);
}
