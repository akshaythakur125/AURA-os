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
import { CATEGORY_PHOTOS, resolveShopImage } from "./shopImage";
import { buildAllShopLinks, type Retailer } from "./linkBuilder";
import { formatLookPrice } from "./pricing";

export interface LookIssue {
  id: string;
  title: string;
  category: string;
  kind:
    | "image-out-of-category"
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
  noKeywords: number;
  byCategory: Record<string, number>;
  issues: LookIssue[];
}

function checkImage(look: Look, issues: LookIssue[]): boolean {
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
    return false;
  }
  // Did any tag actually match, or did we fall back to the hash pick?
  const text = `${look.title} ${look.keywords.join(" ")} ${look.category}`.toLowerCase();
  const matched = pool.some((p) => p.tags.some((t) => text.includes(t)));
  return matched; // returns "true match" so caller can count fallbacks
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
  let noKeywords = 0;
  const byCategory: Record<string, number> = {};

  for (const look of looks) {
    byCategory[look.category] = (byCategory[look.category] ?? 0) + 1;
    const matched = checkImage(look, issues);
    if (!matched) imageFallbacks++;
    checkLinks(look, issues);
    checkPrice(look, issues);
    if (!look.keywords || look.keywords.length === 0) noKeywords++;
  }

  return {
    ok: issues.length === 0,
    total: looks.length,
    checkedAt: new Date().toISOString(),
    imageFallbacks,
    noKeywords,
    byCategory,
    issues,
  };
}
