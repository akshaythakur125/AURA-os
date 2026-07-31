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
import { requestedColors, colorRelation } from "./shopImage";

/** The colour words a look wears, drawn from its own title + keywords. */
function lookColors(look: Look): Set<string> {
  return requestedColors(`${look.title} ${look.keywords.join(" ")}`);
}

// "Boring" neutrals — they technically sit in almost every palette (via cream /
// charcoal), so they shouldn't earn the full colour-flattery boost or a special
// reason. Distinctive colours (olive, rust, camel, navy…) are what make a
// suggestion feel personal.
const NEUTRAL_COLORS = new Set(["white", "black", "grey", "gray", "offwhite", "ivory", "cream", "charcoal"]);
function hasDistinctiveColor(cols: Set<string>): boolean {
  return [...cols].some((c) => !NEUTRAL_COLORS.has(c));
}

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

// Singleton id→look index so detail-page lookups are O(1) and deterministic
// (server and client resolve the same look object for a given id).
let _byIdCache: Map<string, Look> | null = null;

/**
 * Resolves a single look by its stable catalog id.
 * Returns undefined if no look with that id exists.
 */
export function getLookById(id: string): Look | undefined {
  if (!_byIdCache) {
    _byIdCache = new Map(getAllLooks().map((look) => [look.id, look]));
  }
  return _byIdCache.get(id);
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
    paletteColors?: string[];
    avoidColors?: string[];
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

  // Colour flattery — the most "personal" signal. Boost looks whose colour
  // sits in the person's undertone-matched palette, and push down colours the
  // engine says to avoid. Colourless items (bags, tech, most accessories) are
  // untouched. Reuses the shared colour-family engine.
  if (params.paletteColors?.length || params.avoidColors?.length) {
    const cols = lookColors(look);
    if (cols.size) {
      if (params.paletteColors?.length) {
        const rel = colorRelation(requestedColors(params.paletteColors.join(" ")), cols);
        // A distinctive colour match is weighted like an archetype match, so
        // genuinely flattering colours surface — not a wall of white hero looks
        // (white "matches" a warm palette only via cream, so it earns less).
        if (rel === "match") score += hasDistinctiveColor(cols) ? 34 : 8;
        else if (rel === "compatible") score += 6;
      }
      if (params.avoidColors?.length) {
        const avoidRel = colorRelation(requestedColors(params.avoidColors.join(" ")), cols);
        if (avoidRel === "match") score -= 32;
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
  /** Undertone-flattering colours (from the report's colour palette). */
  paletteColors?: string[];
  /** Colours the report says clash with the person's undertone. */
  avoidColors?: string[];
  limit?: number;
}

/**
 * Returns personalized look recommendations based on audit results.
 * Two different inputs should visibly produce two different sets of looks.
 */
export function getPersonalizedLooks(params: PersonalizationParams): Look[] {
  const allLooks = getAllLooks();

  // Filter by gender when the user chose menswear or womenswear (always keep
  // unisex items). "unisex" here means "show me both", so we don't filter.
  let filtered = allLooks;
  if (params.gender === "men" || params.gender === "women") {
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
  const sorted = scored.map((s) => s.look);

  // Diversity pass — a real stylist shows a RANGE (a top, a bottom, shoes, an
  // accessory), not twelve near-identical sage tees. Take the best few per
  // category first so the set spans a wardrobe, then backfill with the rest.
  const limit = params.limit || 20;
  const perCategoryMax = 2;
  const catCount = new Map<string, number>();
  const primary: Look[] = [];
  const overflow: Look[] = [];
  for (const look of sorted) {
    const n = catCount.get(look.category) ?? 0;
    if (n < perCategoryMax) {
      primary.push(look);
      catCount.set(look.category, n + 1);
    } else {
      overflow.push(look);
    }
  }
  return [...primary, ...overflow].slice(0, limit);
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
