/**
 * Single source of truth for the price a shopper sees.
 *
 * The budget FILTER keys off the numeric `look.price`. If the displayed label
 * is maintained separately it can silently drift from that number (a look
 * priced 2400 but labelled "Under ₹2,000" would show under the wrong filter).
 * Deriving the label from `price` here makes that class of mismatch impossible:
 * the label is always consistent with the value the filter used to place it,
 * and the bands line up exactly with the budget options (2000 / 5000 / 10000).
 */

/** Budget band label derived purely from the numeric price. */
export function formatLookPrice(price: number): string {
  if (!Number.isFinite(price) || price <= 0) return "See price";
  if (price <= 500) return "Under ₹500";
  if (price <= 1000) return "Under ₹1,000";
  if (price <= 2000) return "Under ₹2,000";
  if (price <= 5000) return "Under ₹5,000";
  if (price <= 10000) return "Under ₹10,000";
  return "₹10,000+";
}
