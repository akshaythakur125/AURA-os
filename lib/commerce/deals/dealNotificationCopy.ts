export const DEAL_ALERT_COPY = {
  price_drop: {
    title: "Price Dropped",
    body: (title: string, amount: number) => `₹${amount} drop on ${title}`,
    cta: "View Deal",
  },
  target_price_hit: {
    title: "Target Price Reached",
    body: (title: string, price: number) => `${title} is now ₹${price} — at or below your target`,
    cta: "Check It Out",
  },
  strong_discount: {
    title: "Strong Discount Available",
    body: (title: string, percent: number) => `${title} at ${percent}% off`,
    cta: "View Discount",
  },
  stale_price_warning: {
    title: "Price May Be Outdated",
    body: (title: string) => `${title} price hasn't been verified recently`,
    cta: "Verify Price",
  },
  back_in_stock: {
    title: "Back in Stock",
    body: (title: string) => `${title} is available again`,
    cta: "View Product",
  },
  better_store_found: {
    title: "Better Listed Price Found",
    body: (title: string, store: string, price: number) => `${title} also at ${store} for ₹${price}`,
    cta: "Compare Prices",
  },
};

export const DISCLAIMER = "Deal alerts are based on AuraCheck's product catalog and feed snapshots. Verify final price on store.";
