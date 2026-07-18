/**
 * Link Builder — constructs retailer search/category URLs from structured look specs.
 *
 * Every "Shop this" link points to a live retailer SEARCH/CATEGORY results page,
 * not an individual product deep link. This means:
 * - Links never go dead (search pages always resolve to current stock)
 * - Accuracy work happens once (verifying URL patterns for ~5 stores)
 * - Not 400 times (verifying 400 individual links)
 *
 * Verified patterns (July 2026):
 * - Amazon.in: /s?k={query} — confirmed returning relevant results
 * - Flipkart: /search?q={query} — confirmed returning relevant results
 * - Ajio: /search/?text={query} — confirmed returning relevant results
 * - Myntra: /{category}?q={query} — standard pattern (bot-blocked for fetch, but well-documented)
 * - Nykaa Fashion: /search?q={query} — standard pattern
 */

export type Retailer = "amazon" | "flipkart" | "myntra" | "ajio" | "nykaa";

export interface LookSpec {
  category: string;
  keywords: string[];
  gender: "men" | "women" | "unisex";
}

/**
 * Builds a search query string from a look spec.
 * Combines gender context + keywords + category into a natural search query.
 */
function buildSearchQuery(spec: LookSpec, retailer: Retailer): string {
  const parts: string[] = [];

  // Gender prefix (skip for unisex)
  if (spec.gender !== "unisex") {
    parts.push(spec.gender === "men" ? "men" : "women");
  }

  // Keywords (color, fit, style descriptors)
  parts.push(...spec.keywords);

  // Category last for most natural search flow
  parts.push(spec.category);

  const query = parts.join(" ");

  // Retailer-specific encoding
  switch (retailer) {
    case "myntra":
      // Myntra uses + for spaces in query params
      return query.replace(/\s+/g, "+");
    case "ajio":
      // Ajio uses + for spaces
      return query.replace(/\s+/g, "+");
    default:
      // Amazon, Flipkart, Nykaa use %20 or + (both work)
      return query.replace(/\s+/g, "+");
  }
}

/**
 * Builds a retailer-specific search URL from a look spec.
 */
export function buildRetailerUrl(spec: LookSpec, retailer: Retailer): string {
  const query = buildSearchQuery(spec, retailer);

  switch (retailer) {
    case "amazon":
      return `https://www.amazon.in/s?k=${encodeURIComponent(query)}`;

    case "flipkart":
      return `https://www.flipkart.com/search?q=${encodeURIComponent(query)}`;

    case "myntra": {
      // Myntra treats the path as a search term and `rawQuery` drives the
      // results — gender-correct and never a broken category slug. The query
      // already carries gender + keywords + category (e.g. "women floral midi
      // dress"), so results match the actual product.
      const readable = query.replace(/\+/g, " ").trim();
      const path = readable.replace(/\s+/g, "-").toLowerCase();
      return `https://www.myntra.com/${encodeURIComponent(path)}?rawQuery=${encodeURIComponent(readable)}`;
    }

    case "ajio":
      return `https://www.ajio.com/search/?text=${encodeURIComponent(query)}`;

    case "nykaa":
      return `https://www.nykaafashion.com/search?q=${encodeURIComponent(query)}`;

    default:
      return `https://www.amazon.in/s?k=${encodeURIComponent(query)}`;
  }
}

/**
 * Builds shop links for all retailers for a given look spec.
 * Returns an array of { retailer, url, label } objects.
 */
export function buildAllShopLinks(spec: LookSpec): {
  retailer: Retailer;
  url: string;
  label: string;
}[] {
  const retailers: { retailer: Retailer; label: string }[] = [
    { retailer: "amazon", label: "Amazon" },
    { retailer: "flipkart", label: "Flipkart" },
    { retailer: "myntra", label: "Myntra" },
    { retailer: "ajio", label: "Ajio" },
  ];

  return retailers.map((r) => ({
    retailer: r.retailer,
    url: buildRetailerUrl(spec, r.retailer),
    label: r.label,
  }));
}

/**
 * Returns the primary (default) shop link for a look spec.
 * Defaults to Amazon as it has the broadest catalog.
 */
export function buildPrimaryShopLink(spec: LookSpec): string {
  return buildRetailerUrl(spec, "amazon");
}
