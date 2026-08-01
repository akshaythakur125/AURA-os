import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Geocode an address to precise coordinates (Google Geocoding API) so the
 * concierge can pull genuinely NEARBY places by radius rather than a fuzzy text
 * match. Server-side only — the key is never exposed. Rate-limited; 503 when
 * unset so the caller can fall back to typing a city into a text search.
 */
const hits = new Map<string, { count: number; resetAt: number }>();
function rateLimited(ip: string): boolean {
  const now = Date.now();
  const rec = hits.get(ip);
  if (!rec || now > rec.resetAt) { hits.set(ip, { count: 1, resetAt: now + 5 * 60 * 1000 }); return false; }
  rec.count++;
  return rec.count > 30;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const address = (searchParams.get("address") || "").slice(0, 200).trim();
  if (!address) return NextResponse.json({ error: "address is required" }, { status: 400 });

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anon";
  if (rateLimited(ip)) return NextResponse.json({ error: "rate_limited" }, { status: 429 });

  const API_KEY = process.env.GOOGLE_MAPS_API_KEY || "";
  if (!API_KEY) return NextResponse.json({ error: "not_configured" }, { status: 503 });

  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&region=in&key=${API_KEY}`;
    const res = await fetch(url);
    const data = (await res.json()) as { status?: string; results?: Array<{ geometry?: { location?: { lat: number; lng: number } }; formatted_address?: string }> };
    if (data.status !== "OK" || !data.results?.length) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    const loc = data.results[0].geometry?.location;
    if (!loc) return NextResponse.json({ error: "not_found" }, { status: 404 });
    return NextResponse.json({ lat: loc.lat, lng: loc.lng, formatted: data.results[0].formatted_address || address });
  } catch {
    return NextResponse.json({ error: "fetch_failed" }, { status: 502 });
  }
}
