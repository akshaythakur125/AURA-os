/**
 * Affiliate link wrapping — makes outbound retailer links commissionable.
 *
 * Client-safe: affiliate ids / network pub-ids show up in the public redirect
 * URL the moment a user clicks, so exposing them via NEXT_PUBLIC_* is fine.
 *
 * Two independent, env-gated mechanisms (both OFF by default):
 *  - Amazon direct: append your Associates tag to amazon.* links.
 *  - Network wrap: route non-Amazon links (Myntra / Flipkart / Ajio / Nykaa)
 *    through a link-kit network (e.g. Cuelinks) using a URL template that
 *    carries your pub id. Set NEXT_PUBLIC_AFFILIATE_WRAP_AMAZON=true to send
 *    Amazon through the network too (default keeps Amazon on its direct tag,
 *    which usually pays better and cleaner).
 *
 * When nothing is configured, links pass through completely unchanged.
 */

const AMAZON_TAG =
  process.env.NEXT_PUBLIC_AMAZON_ASSOCIATE_TAG || process.env.AMAZON_ASSOCIATE_TAG || "";
// Template must contain the literal {url}, e.g.
//   https://linksredirect.com/?pub_id=XXXXX&source=linkkit&url={url}
const WRAP_TEMPLATE = process.env.NEXT_PUBLIC_AFFILIATE_LINK_WRAP_TEMPLATE || "";
const WRAP_AMAZON = (process.env.NEXT_PUBLIC_AFFILIATE_WRAP_AMAZON || "").toLowerCase() === "true";

function looksAmazon(url: string, retailer?: string): boolean {
  if (retailer === "amazon") return true;
  return /amazon\./i.test(url);
}

function appendAmazonTag(url: string): string {
  if (!AMAZON_TAG) return url;
  try {
    const u = new URL(url);
    u.searchParams.set("tag", AMAZON_TAG);
    return u.toString();
  } catch {
    return url;
  }
}

function networkWrap(url: string): string {
  if (!WRAP_TEMPLATE.includes("{url}")) return url;
  return WRAP_TEMPLATE.replace("{url}", encodeURIComponent(url));
}

/**
 * Returns the affiliate-wrapped version of a retailer URL, or the URL unchanged
 * when nothing is configured. Pass the retailer when known so Amazon detection
 * is exact even for shortened/edge URLs.
 */
export function affiliateWrap(url: string, retailer?: string): string {
  if (!url) return url;

  if (looksAmazon(url, retailer)) {
    if (WRAP_AMAZON && WRAP_TEMPLATE) return networkWrap(appendAmazonTag(url));
    return appendAmazonTag(url);
  }

  return WRAP_TEMPLATE ? networkWrap(url) : url;
}

/** True when at least one affiliate mechanism is configured. */
export function affiliateConfigured(): boolean {
  return Boolean(AMAZON_TAG || WRAP_TEMPLATE);
}
