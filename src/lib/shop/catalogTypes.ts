/**
 * Look Catalog — personalized shopping recommendations.
 *
 * Each "look" maps to a structured spec that the link-builder converts
 * into real retailer search URLs. No individual deep links that can rot.
 *
 * Tags reuse the existing vocabulary from the scoring system:
 * - StatusLeakTag, GoalTag, StyleIntent, BudgetTag, AuditTypeTag
 *
 * Categories: the same ProductCategory from the existing product system,
 * extended with fashion-specific entries for the look catalog.
 */

import type { StatusLeakTag, GoalTag, BudgetTag, AuditTypeTag } from "@/types/product";
import type { StyleIntent } from "@/types/personalization";
import { buildAllShopLinks, buildPrimaryShopLink, type Retailer } from "./linkBuilder";
import { getExactProductLink } from "./exactProductLinks";

export type LookCategory =
  | "tshirt"
  | "shirt"
  | "jeans"
  | "trousers"
  | "shorts"
  | "jacket"
  | "hoodie"
  | "sweatshirt"
  | "sneakers"
  | "shoes"
  | "sandals"
  | "watch"
  | "sunglasses"
  | "backpack"
  | "fragrance"
  | "grooming"
  | "earrings"
  | "heels"
  | "flats"
  | "dress"
  | "kurta"
  | "saree"
  | "accessory";

export interface Look {
  id: string;
  title: string;
  description: string;
  category: LookCategory;
  price: number;
  priceLabel: string;
  keywords: string[];
  gender: "men" | "women" | "unisex";

  // Personalization tags — reuse existing vocabulary
  styleArchetypes: StyleIntent[];
  statusLeakTags: StatusLeakTag[];
  goalTags: GoalTag[];
  budgetTags: BudgetTag[];
  auditTypeTags: AuditTypeTag[];

  // Visual
  imageUrl: string;
  imageAlt: string;

  // Metadata
  isHero: boolean; // true = hand-curated, false = generated
  priorityScore: number; // 0-100, used for ranking
  createdAt: string;
}

export interface ShopLink {
  retailer: Retailer;
  url: string;
  label: string;
  exact?: boolean;
  productTitle?: string;
}

function getAffiliateRedirectUrl(lookId: string): string {
  return `/api/shop/affiliate?lookId=${encodeURIComponent(lookId)}`;
}

/**
 * Builds all shop links for a look using the link-builder utility.
 */
export function getLookShopLinks(look: Look): ShopLink[] {
  const exact = getExactProductLink(look.id);
  const searchLinks = buildAllShopLinks({
    category: look.category,
    keywords: look.keywords,
    gender: look.gender,
  }).map((link) => ({
    ...link,
    label: exact && link.retailer === exact.retailer ? `${link.label} Search` : link.label,
  }));

  if (!exact) {
    return searchLinks;
  }

  return [
    {
      retailer: exact.retailer,
      url: getAffiliateRedirectUrl(look.id),
      label: "Amazon Exact Match",
      exact: true,
      productTitle: exact.productTitle,
    },
    ...searchLinks,
  ];
}

export function getLookExactProduct(look: Look) {
  return getExactProductLink(look.id);
}

/**
 * Returns the primary shop URL for a look.
 */
export function getLookPrimaryUrl(look: Look): string {
  if (getExactProductLink(look.id)) {
    return getAffiliateRedirectUrl(look.id);
  }

  return buildPrimaryShopLink({
    category: look.category,
    keywords: look.keywords,
    gender: look.gender,
  });
}
