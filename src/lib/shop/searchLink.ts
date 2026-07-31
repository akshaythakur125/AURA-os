import { affiliateWrap } from "./affiliate";

// Builds an affiliate-wrapped retailer SEARCH link for an arbitrary query —
// used for products that aren't in the fashion look catalog (photo gear,
// grooming). Amazon gets the direct tag; others go through the network wrap
// when configured, else plain.

export type SearchRetailer = "amazon" | "flipkart" | "nykaa" | "lenskart";

const BASES: Record<SearchRetailer, (q: string) => string> = {
  amazon: (q) => `https://www.amazon.in/s?k=${q}`,
  flipkart: (q) => `https://www.flipkart.com/search?q=${q}`,
  nykaa: (q) => `https://www.nykaa.com/search/result/?q=${q}`,
  // Eyewear — the natural home for face-shape → frame recommendations.
  lenskart: (q) => `https://www.lenskart.com/search?q=${q}`,
};

export function searchLink(query: string, retailer: SearchRetailer = "amazon"): string {
  return affiliateWrap(BASES[retailer](encodeURIComponent(query)), retailer);
}
