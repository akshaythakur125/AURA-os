/**
 * Catalog integrity auditor.
 *
 * Proves the "no product mismatch" guarantee by checking every look against
 * the exact invariants the shop depends on:
 *
 *  - IMAGE  — resolves to a photo drawn from the look's OWN category pool
 *             (never cross-category). Tracked separately: looks that fall back
 *             to the stable hash pick because no tag matched (allowed, but
 *             surfaced so the count stays honest).
 *  - LINK   — every retailer URL is a valid absolute https URL whose search
 *             query carries the look's category token (so the buy link lands
 *             on the right kind of product, for every retailer).
 *  - PRICE  — positive and maps to a real budget band via the single price
 *             formatter (the same number the budget filter uses).
 *
 * Hard problems flip `ok` to false; soft signals (image fallback, missing
 * keywords) are counted but don't fail the audit.
 */

import type { Look } from "./catalogTypes";
import {
  CATEGORY_PHOTOS,
  resolveShopImage,
  tokenize,
  tagMatches,
  baseScore,
  scorePhoto,
  requestedColors,
  photoColorSet,
  colorRelation,
  type ColorRelation,
} from "./shopImage";
import { buildAllShopLinks, type Retailer } from "./linkBuilder";
import { formatLookPrice } from "./pricing";

export interface LookIssue {
  id: string;
  title: string;
  category: string;
  kind:
    | "image-out-of-category"
    | "image-colour-mismatch"
    | "price-invalid"
    | "link-malformed"
    | "link-missing-category";
  detail: string;
}

export interface CatalogReport {
  ok: boolean;
  total: number;
  checkedAt: string;
  imageFallbacks: number;
  /** Products whose named colour has NO matching photo in the pool (coverage
   * gaps — soft, since the resolver still returns the least-wrong image). */
  colourGaps: number;
  noKeywords: number;
  byCategory: Record<string, number>;
  issues: LookIssue[];
}

interface ImageCheck {
  matched: boolean; // a tag actually matched (vs. hash fallback)
  colourGap: boolean; // the named colour has no matching photo in the pool
}

function checkImage(look: Look, issues: LookIssue[]): ImageCheck {
  const pool = CATEGORY_PHOTOS[look.category];
  const chosen = resolveShopImage(look.category, look.title, look.keywords);
  // The chosen photo must come from this category's own pool.
  const inCategory = !!pool && pool.some((p) => p.url === chosen.url);
  if (!inCategory) {
    issues.push({
      id: look.id,
      title: look.title,
      category: look.category,
      kind: "image-out-of-category",
      detail: `resolved image "${chosen.alt}" is not in the ${look.category} pool`,
    });
    return { matched: false, colourGap: false };
  }

  const text = `${look.title} ${look.keywords.join(" ")} ${look.category}`.toLowerCase();
  const tokens = tokenize(text);
  const matched = pool.some((p) => p.tags.some((t) => tagMatches(t, tokens)));

  // Colour consistency. The resolver picks the highest (type + colour) score,
  // so a colour clash is only an AVOIDABLE bug when another photo is at least
  // as type-correct AND strictly more colour-correct — i.e. the resolver should
  // have chosen it. When the clashing photo is the most type-correct option
  // (type beats colour, by design) or nothing matches the colour, it's a soft
  // coverage gap: surfaced in the count, but not a hard failure.
  let colourGap = false;
  const req = requestedColors(text);
  const chosenRel = req.size ? colorRelation(req, photoColorSet(chosen)) : "n/a";
  if (chosenRel === "clash") {
    // Was this a real, positive-score pick, or a stable hash fallback (no photo
    // matched at all)? A clash is only an AVOIDABLE bug when the resolver made a
    // positive pick AND another photo is at least as type-correct and strictly
    // more colour-correct. Otherwise it's a soft coverage gap.
    const positivePick = pool.some((p) => scorePhoto(p, tokens, req) > 0);
    const rank: Record<ColorRelation, number> = { match: 3, compatible: 2, "n/a": 1, clash: 0 };
    const chosenType = baseScore(chosen, tokens);
    const dominant = positivePick
      ? pool.find(
          (p) =>
            p.url !== chosen.url &&
            baseScore(p, tokens) >= chosenType &&
            rank[colorRelation(req, photoColorSet(p))] > rank[chosenRel],
        )
      : undefined;
    if (dominant) {
      issues.push({
        id: look.id,
        title: look.title,
        category: look.category,
        kind: "image-colour-mismatch",
        detail: `chose "${chosen.alt}" but "${dominant.alt}" is as on-type and better on colour`,
      });
    } else {
      colourGap = true;
    }
  }
  return { matched, colourGap };
}

function checkLinks(look: Look, issues: LookIssue[]): void {
  const links = buildAllShopLinks({
    category: look.category,
    keywords: look.keywords,
    gender: look.gender,
  });
  for (const { retailer, url } of links) {
    let parsed: URL | null = null;
    try {
      parsed = new URL(url);
    } catch {
      parsed = null;
    }
    if (!parsed || parsed.protocol !== "https:") {
      issues.push({
        id: look.id,
        title: look.title,
        category: look.category,
        kind: "link-malformed",
        detail: `${retailer as Retailer} link is not a valid https URL: ${url}`,
      });
      continue;
    }
    const decoded = decodeURIComponent(url).toLowerCase();
    if (!decoded.includes(look.category.toLowerCase())) {
      issues.push({
        id: look.id,
        title: look.title,
        category: look.category,
        kind: "link-missing-category",
        detail: `${retailer as Retailer} link does not carry the "${look.category}" token`,
      });
    }
  }
}

function checkPrice(look: Look, issues: LookIssue[]): void {
  const label = formatLookPrice(look.price);
  if (!Number.isFinite(look.price) || look.price <= 0 || label === "See price") {
    issues.push({
      id: look.id,
      title: look.title,
      category: look.category,
      kind: "price-invalid",
      detail: `price "${look.price}" does not map to a budget band`,
    });
  }
}

/** Audits the whole catalog. Pass the looks in (avoids a circular import). */
export function verifyCatalog(looks: Look[]): CatalogReport {
  const issues: LookIssue[] = [];
  let imageFallbacks = 0;
  let colourGaps = 0;
  let noKeywords = 0;
  const byCategory: Record<string, number> = {};

  for (const look of looks) {
    byCategory[look.category] = (byCategory[look.category] ?? 0) + 1;
    const { matched, colourGap } = checkImage(look, issues);
    if (!matched) imageFallbacks++;
    if (colourGap) colourGaps++;
    checkLinks(look, issues);
    checkPrice(look, issues);
    if (!look.keywords || look.keywords.length === 0) noKeywords++;
  }

  return {
    ok: issues.length === 0,
    total: looks.length,
    checkedAt: new Date().toISOString(),
    imageFallbacks,
    colourGaps,
    noKeywords,
    byCategory,
    issues,
  };
}
