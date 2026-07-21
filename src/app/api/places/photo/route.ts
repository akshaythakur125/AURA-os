import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Proxies a Google Place photo so the API key stays server-side. The client
// requests /api/places/photo?name=<photo resource name> and we stream the image.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get("name");
  if (!name) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }
  // Photo resource names look like: places/{placeId}/photos/{photoId}
  // Validate strictly to avoid the key being used to fetch arbitrary URLs.
  if (!/^places\/[A-Za-z0-9_-]+\/photos\/[A-Za-z0-9_-]+$/.test(name)) {
    return NextResponse.json({ error: "invalid photo name" }, { status: 400 });
  }

  const API_KEY = process.env.GOOGLE_MAPS_API_KEY || "";
  if (!API_KEY) {
    return NextResponse.json({ error: "Google Maps API key not configured" }, { status: 500 });
  }

  try {
    const url = `https://places.googleapis.com/v1/${name}/media?maxWidthPx=480&key=${API_KEY}`;
    const res = await fetch(url);
    if (!res.ok) {
      return NextResponse.json({ error: "photo fetch failed" }, { status: 502 });
    }
    const buf = await res.arrayBuffer();
    return new NextResponse(buf, {
      status: 200,
      headers: {
        "Content-Type": res.headers.get("content-type") || "image/jpeg",
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch {
    return NextResponse.json({ error: "photo proxy error" }, { status: 500 });
  }
}
