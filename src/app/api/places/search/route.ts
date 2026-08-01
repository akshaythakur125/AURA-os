import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Text search over Google Places API (New) — server-side only, key never
 * exposed. Powers the Date & Dining Playbook: given a venue query and a city
 * (no geolocation prompt needed), returns real places with the full detail a
 * proper app shows — name, rating, review count, price level, open-now, a
 * photo reference (streamed via /api/places/photo), an editorial blurb and the
 * canonical Maps link. Rate-limited; degrades to 503 when the key is unset so
 * callers fall back to a plain map search.
 */
interface PlaceResult {
  name: string;
  type: string;
  area: string;
  rating: number;
  totalRatings: number;
  photoReference: string | null;
  mapUrl: string;
  openNow: boolean | null;
  priceLevel: number | null;
  summary: string | null;
  phone: string | null;
  website: string | null;
}

const PRICE_MAP: Record<string, number> = {
  PRICE_LEVEL_FREE: 0, PRICE_LEVEL_INEXPENSIVE: 1, PRICE_LEVEL_MODERATE: 2,
  PRICE_LEVEL_EXPENSIVE: 3, PRICE_LEVEL_VERY_EXPENSIVE: 4,
};

const hits = new Map<string, { count: number; resetAt: number }>();
function rateLimited(ip: string): boolean {
  const now = Date.now();
  const rec = hits.get(ip);
  if (!rec || now > rec.resetAt) { hits.set(ip, { count: 1, resetAt: now + 5 * 60 * 1000 }); return false; }
  rec.count++;
  return rec.count > 40;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = (searchParams.get("query") || "").slice(0, 120).trim();
  const city = (searchParams.get("city") || "").slice(0, 80).trim();
  const lat = parseFloat(searchParams.get("lat") || "");
  const lng = parseFloat(searchParams.get("lng") || "");
  if (!query) return NextResponse.json({ error: "query is required" }, { status: 400 });

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anon";
  if (rateLimited(ip)) return NextResponse.json({ error: "rate_limited" }, { status: 429 });

  const API_KEY = process.env.GOOGLE_MAPS_API_KEY || "";
  if (!API_KEY) return NextResponse.json({ error: "not_configured" }, { status: 503 });

  const body: Record<string, unknown> = {
    textQuery: `${query}${city ? ` in ${city}` : ""}`,
    maxResultCount: 6,
    rankPreference: "RELEVANCE",
  };
  if (!Number.isNaN(lat) && !Number.isNaN(lng) && lat && lng) {
    body.locationBias = { circle: { center: { latitude: lat, longitude: lng }, radius: 8000 } };
  }

  try {
    const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": API_KEY,
        "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.photos,places.currentOpeningHours.openNow,places.priceLevel,places.googleMapsUri,places.editorialSummary,places.primaryTypeDisplayName,places.nationalPhoneNumber,places.websiteUri",
      },
      body: JSON.stringify(body),
    });
    const data = (await res.json()) as Record<string, unknown>;
    if (!res.ok || data.error) {
      const err = data.error as Record<string, unknown> | undefined;
      return NextResponse.json({ error: (err?.message as string) || `HTTP ${res.status}` }, { status: 502 });
    }

    const places: PlaceResult[] = ((data.places as Record<string, unknown>[]) || []).map((p) => {
      const displayName = p.displayName as { text?: string } | undefined;
      const opening = p.currentOpeningHours as { openNow?: boolean } | undefined;
      const photos = p.photos as Array<{ name: string }> | undefined;
      const priceEnum = p.priceLevel as string | undefined;
      const primary = p.primaryTypeDisplayName as { text?: string } | undefined;
      const editorial = p.editorialSummary as { text?: string } | undefined;
      return {
        name: displayName?.text || "Unknown",
        type: primary?.text || "",
        area: (p.formattedAddress as string) || "",
        rating: (p.rating as number) || 0,
        totalRatings: (p.userRatingCount as number) || 0,
        photoReference: photos?.[0]?.name || null,
        mapUrl: (p.googleMapsUri as string) || `https://www.google.com/maps/place/?q=place_id:${p.id}`,
        openNow: opening?.openNow ?? null,
        priceLevel: priceEnum != null && priceEnum in PRICE_MAP ? PRICE_MAP[priceEnum] : null,
        summary: editorial?.text || null,
        phone: (p.nationalPhoneNumber as string) || null,
        website: (p.websiteUri as string) || null,
      };
    });

    return NextResponse.json({ places });
  } catch {
    return NextResponse.json({ error: "fetch_failed" }, { status: 502 });
  }
}
