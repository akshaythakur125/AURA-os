// Live product feed — returns REAL products (title, price, image, direct link)
// for a search query when a provider is configured, else an empty result so the
// UI falls back to the curated buy list. Never fabricates data.
//
// Provider is chosen by env (dark until you add a key):
//   SHOP_FEED_PROVIDER = "rapidapi_amazon"  (default when RAPIDAPI_KEY is set)
//   RAPIDAPI_KEY        = <your RapidAPI key>
//   RAPIDAPI_AMAZON_HOST = real-time-amazon-data.p.rapidapi.com   (default)
//   AMAZON_ASSOCIATE_TAG = <your associate tag>   (optional — appended to links)
//
// Adding another provider = one more adapter function returning LiveProduct[].

export const dynamic = "force-dynamic";

export interface LiveProduct {
  title: string;
  price: number;
  currency: string;
  image: string | null;
  url: string;
  retailer: string;
}

function toNumber(v: unknown): number | null {
  if (typeof v === "number") return Number.isFinite(v) ? Math.round(v) : null;
  if (typeof v !== "string") return null;
  const cleaned = v.replace(/[^0-9.]/g, "");
  if (!cleaned) return null;
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? Math.round(n) : null;
}

function withAffiliateTag(url: string): string {
  const tag = process.env.AMAZON_ASSOCIATE_TAG;
  if (!tag) return url;
  try {
    const u = new URL(url);
    u.searchParams.set("tag", tag);
    return u.toString();
  } catch {
    return url;
  }
}

// ── Provider: RapidAPI "real-time-amazon-data" (or a compatible shape) ──
// Parsing is deliberately defensive: field names vary between RapidAPI Amazon
// providers, so we accept the common aliases and skip anything missing a
// title / price / link rather than guessing.
async function rapidApiAmazon(query: string, maxPrice?: number): Promise<LiveProduct[]> {
  const key = process.env.RAPIDAPI_KEY;
  if (!key) return [];
  const host = process.env.RAPIDAPI_AMAZON_HOST || "real-time-amazon-data.p.rapidapi.com";
  const url = `https://${host}/search?query=${encodeURIComponent(query)}&country=IN&page=1&sort_by=LOWEST_PRICE`;

  const res = await fetch(url, {
    headers: { "X-RapidAPI-Key": key, "X-RapidAPI-Host": host },
    // never let a slow provider hang the request
    signal: AbortSignal.timeout(6000),
  });
  if (!res.ok) return [];
  const json = (await res.json()) as Record<string, unknown>;

  const data = (json.data ?? json) as Record<string, unknown>;
  const items = (Array.isArray(data.products) ? data.products : Array.isArray(json.products) ? json.products : []) as Record<string, unknown>[];

  const out: LiveProduct[] = [];
  for (const it of items) {
    const title = (it.product_title ?? it.title ?? it.name) as string | undefined;
    const link = (it.product_url ?? it.url ?? it.link ?? it.detail_url) as string | undefined;
    const price = toNumber(it.product_price ?? it.price ?? it.current_price ?? it.sale_price);
    if (!title || !link || price == null || price <= 0) continue;
    if (maxPrice && price > maxPrice) continue;
    out.push({
      title,
      price,
      currency: "INR",
      image: (it.product_photo ?? it.image ?? it.thumbnail ?? null) as string | null,
      url: withAffiliateTag(link),
      retailer: "amazon",
    });
  }
  return out;
}

function activeProvider(): string {
  const explicit = process.env.SHOP_FEED_PROVIDER;
  if (explicit) return explicit;
  if (process.env.RAPIDAPI_KEY) return "rapidapi_amazon";
  return "";
}

// Small in-memory cache to protect provider quota (same query within TTL).
const CACHE = new Map<string, { at: number; products: LiveProduct[] }>();
const TTL_MS = 30 * 60 * 1000;

export async function POST(request: Request) {
  try {
    const { query, maxPrice } = (await request.json()) as { query?: string; maxPrice?: number };
    const provider = activeProvider();
    if (!provider || !query || !query.trim()) {
      return Response.json({ configured: Boolean(provider), products: [] });
    }

    const cacheKey = `${provider}:${query.trim().toLowerCase()}:${maxPrice ?? ""}`;
    const hit = CACHE.get(cacheKey);
    if (hit && Date.now() - hit.at < TTL_MS) {
      return Response.json({ configured: true, products: hit.products, cached: true });
    }

    let products: LiveProduct[] = [];
    try {
      if (provider === "rapidapi_amazon") products = await rapidApiAmazon(query.trim(), maxPrice);
    } catch {
      products = [];
    }
    products.sort((a, b) => a.price - b.price);
    products = products.slice(0, 10);

    CACHE.set(cacheKey, { at: Date.now(), products });
    return Response.json({ configured: true, products });
  } catch {
    return Response.json({ configured: false, products: [] });
  }
}
