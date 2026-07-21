import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Google Maps Places API (New) — server-side only, key never exposed to client
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
  phone: string | null;
  website: string | null;
}

const TYPE_MAP: Record<string, string> = {
  salon: "beauty_salon",
  gym: "gym",
};

const LABEL_MAP: Record<string, string> = {
  salon: "Salon & Beauty",
  photographer: "Photographer",
  gym: "Gym & Fitness",
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = parseFloat(searchParams.get("lat") || "0");
    const lng = parseFloat(searchParams.get("lng") || "0");
    const radius = parseInt(searchParams.get("radius") || "5000", 10);
    const rawType = searchParams.get("type") || "salon";

    if (!lat || !lng) {
      return NextResponse.json({ error: "lat and lng are required" }, { status: 400 });
    }

    const API_KEY = process.env.GOOGLE_MAPS_API_KEY || "";
    if (!API_KEY) {
      return NextResponse.json({ error: "Google Maps API key not configured" }, { status: 500 });
    }

    const includedType = TYPE_MAP[rawType];
    let data: Record<string, unknown>;

    if (includedType) {
      // Places API (New) — searchNearby with type filter
      const url = "https://places.googleapis.com/v1/places:searchNearby";
      const body = {
        maxResultCount: 8,
        locationRestriction: {
          circle: {
            center: { latitude: lat, longitude: lng },
            radius: radius,
          },
        },
        includedTypes: [includedType],
      };

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": API_KEY,
          "X-Goog-FieldMask": "places.displayName,places.types,places.formattedAddress,places.rating,places.userRatingCount,places.photos,places.id,places.currentOpeningHours.openNow,places.priceLevel,places.nationalPhoneNumber,places.websiteUri",
        },
        body: JSON.stringify(body),
      });
      data = await res.json();
      if (!res.ok || data.error) {
        return NextResponse.json(
          { error: `Google Places API error: ${(data.error as Record<string, unknown>)?.message || "Unknown"}`, details: JSON.stringify(data.error) },
          { status: 502 }
        );
      }
    } else {
      // For unsupported types (photographer, etc.) — use textSearch with keyword
      const url = "https://places.googleapis.com/v1/places:searchText";
      const body = {
        textQuery: rawType + " near me",
        maxResultCount: 8,
        locationBias: {
          circle: {
            center: { latitude: lat, longitude: lng },
            radius: radius,
          },
        },
      };

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": API_KEY,
          "X-Goog-FieldMask": "places.displayName,places.types,places.formattedAddress,places.rating,places.userRatingCount,places.photos,places.id,places.currentOpeningHours.openNow,places.priceLevel,places.nationalPhoneNumber,places.websiteUri",
        },
        body: JSON.stringify(body),
      });
      data = await res.json();
      if (!res.ok || data.error) {
        return NextResponse.json(
          { error: `Google Places API error: ${(data.error as Record<string, unknown>)?.message || "Unknown"}`, details: JSON.stringify(data.error) },
          { status: 502 }
        );
      }
    }

    const places: PlaceResult[] = ((data.places as Record<string, unknown>[]) || []).map((p) => {
      const types = (p.types as string[]) || [];
      const photos = p.photos as Array<{ name: string }> | undefined;
      const displayName = p.displayName as { text: string } | undefined;
      const opening = p.currentOpeningHours as { openNow?: boolean } | undefined;
      // Places API (New) price level is an enum string; map to 0–4.
      const priceEnum = p.priceLevel as string | undefined;
      const priceMap: Record<string, number> = {
        PRICE_LEVEL_FREE: 0, PRICE_LEVEL_INEXPENSIVE: 1, PRICE_LEVEL_MODERATE: 2,
        PRICE_LEVEL_EXPENSIVE: 3, PRICE_LEVEL_VERY_EXPENSIVE: 4,
      };
      return {
        name: displayName?.text || "Unknown",
        type: types.includes("hair_care") ? "Hair care"
          : types.includes("beauty_salon") ? "Beauty salon"
          : types.includes("barber") ? "Barbershop"
          : types.includes("spa") ? "Spa"
          : types.includes("gym") ? "Gym / Fitness"
          : types.includes("clothing_store") ? "Clothing store"
          : types.includes("photographer") ? "Photographer"
          : "Grooming",
        area: (p.formattedAddress as string) || "",
        rating: (p.rating as number) || 0,
        totalRatings: (p.userRatingCount as number) || 0,
        photoReference: photos?.[0]?.name || null,
        mapUrl: `https://www.google.com/maps/place/?q=place_id:${p.id}`,
        openNow: opening?.openNow ?? null,
        priceLevel: priceEnum != null && priceEnum in priceMap ? priceMap[priceEnum] : null,
        phone: (p.nationalPhoneNumber as string) || null,
        website: (p.websiteUri as string) || null,
      };
    });

    return NextResponse.json({
      places,
      category: LABEL_MAP[rawType] || rawType,
    });
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch places" }, { status: 500 });
  }
}
