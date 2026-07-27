// Client helper for the live product feed. Returns real products when a
// provider is configured server-side, or an empty array otherwise — callers
// must treat [] as "fall back to the curated buy list".

export interface LiveProduct {
  title: string;
  price: number;
  currency: string;
  image: string | null;
  url: string;
  retailer: string;
}

export async function fetchLiveProducts(query: string, maxPrice?: number): Promise<LiveProduct[]> {
  try {
    const res = await fetch("/api/shop/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, maxPrice }),
    });
    if (!res.ok) return [];
    const data = (await res.json()) as { products?: LiveProduct[] };
    return Array.isArray(data.products) ? data.products : [];
  } catch {
    return [];
  }
}

/** Builds the retailer search query the feed expects from a look spec. */
export function queryForLook(spec: { keywords: string[]; category: string; gender: "men" | "women" | "unisex" }): string {
  const parts: string[] = [];
  if (spec.gender !== "unisex") parts.push(spec.gender);
  parts.push(...spec.keywords, spec.category);
  return parts.join(" ");
}
