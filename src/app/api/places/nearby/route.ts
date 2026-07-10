import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// ponytail: Google Maps Places API — server-side only, key never exposed to client

interface PlaceResult {
  name: string;
  type: string;
  area: string;
  rating: number;
  totalRatings: number;
  photoReference: string | null;
  mapUrl: string;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = parseFloat(searchParams.get("lat") || "0");
    const lng = parseFloat(searchParams.get("lng") || "0");
    const radius = parseInt(searchParams.get("radius") || "5000", 10); // default 5km
    const type = searchParams.get("type") || "beauty_salon"; // ponytail: beauty_salon covers salons, spas, barbershops

    if (!lat || !lng) {
      return NextResponse.json({ error: "lat and lng are required" }, { status: 400 });
    }

    const API_KEY = process.env.GOOGLE_MAPS_API_KEY || "";
    if (!API_KEY) {
      return NextResponse.json({ error: "Google Maps API key not configured" }, { status: 500 });
    }

    // ponytail: Places API Nearby Search — max 20 results, sorted by importance
    const url = new URL("https://maps.googleapis.com/maps/api/place/nearbysearch/json");
    url.searchParams.set("location", `${lat},${lng}`);
    url.searchParams.set("radius", String(radius));
    url.searchParams.set("type", type);
    url.searchParams.set("key", API_KEY);
    url.searchParams.set("rankby", "prominence");

    const res = await fetch(url.toString());
    const data = await res.json();

    if (data.status !== "OK") {
      return NextResponse.json(
        { error: `Google Places API error: ${data.status}`, details: data.error_message },
        { status: 502 }
      );
    }

    const places: PlaceResult[] = (data.results || []).slice(0, 8).map((p: Record<string, unknown>) => {
      const loc = (p.geometry as Record<string, unknown>) as { location: { lat: number; lng: number } };
      const photos = p.photos as Array<{ photo_reference: string }> | undefined;
      return {
        name: p.name as string,
        type: (p.types as string[])?.includes("hair_care") ? "Hair care"
          : (p.types as string[])?.includes("beauty_salon") ? "Beauty salon"
          : (p.types as string[])?.includes("barber") ? "Barbershop"
          : (p.types as string[])?.includes("spa") ? "Spa"
          : (p.types as string[])?.includes("gym") ? "Gym / Fitness"
          : (p.types as string[])?.includes("clothing_store") ? "Clothing store"
          : (p.types as string[])?.includes("shoe_store") ? "Footwear"
          : (p.types as string[])?.includes("jewelry_store") ? "Jewelry"
          : "Grooming",
        area: p.vicinity as string || "",
        rating: (p.rating as number) || 0,
        totalRatings: (p.user_ratings_total as number) || 0,
        photoReference: photos?.[0]?.photo_reference || null,
        mapUrl: `https://www.google.com/maps/place/?q=place_id:${p.place_id}`,
      };
    });

    return NextResponse.json({ places, city: data.results?.[0]?. vicinity?.split(",")?.pop()?.trim() || null });
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch places" }, { status: 500 });
  }
}
