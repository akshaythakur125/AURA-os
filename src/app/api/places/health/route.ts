import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Confirms the Google Maps key works and which rich Places fields come back —
// without exposing the key or any raw place data. Makes one lightweight
// searchNearby call to a fixed location and reports field availability.
export async function GET() {
  const API_KEY = process.env.GOOGLE_MAPS_API_KEY || "";
  if (!API_KEY) {
    return NextResponse.json(
      { ok: false, keyConfigured: false, placesApiOk: false, message: "GOOGLE_MAPS_API_KEY not set" },
      { status: 503 }
    );
  }

  try {
    const res = await fetch("https://places.googleapis.com/v1/places:searchNearby", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": API_KEY,
        "X-Goog-FieldMask":
          "places.id,places.rating,places.photos,places.currentOpeningHours.openNow,places.priceLevel,places.nationalPhoneNumber,places.websiteUri",
      },
      body: JSON.stringify({
        maxResultCount: 5,
        // Connaught Place, New Delhi — a dense area guaranteed to have results.
        locationRestriction: { circle: { center: { latitude: 28.6315, longitude: 77.2167 }, radius: 3000 } },
        includedTypes: ["beauty_salon"],
      }),
    });

    const data = (await res.json()) as Record<string, unknown>;
    if (!res.ok || data.error) {
      const err = data.error as Record<string, unknown> | undefined;
      return NextResponse.json(
        { ok: false, keyConfigured: true, placesApiOk: false, message: (err?.message as string) || `HTTP ${res.status}` },
        { status: 502 }
      );
    }

    const places = (data.places as Record<string, unknown>[]) || [];
    // Report whether each rich field appears in ANY of the sample results
    // (a single salon may omit some fields even when the API supports them).
    const any = (pred: (p: Record<string, unknown>) => boolean) => places.some(pred);
    const fields = {
      rating: any((p) => p.rating !== undefined),
      photo: any((p) => Array.isArray(p.photos) && (p.photos as unknown[]).length > 0),
      openNow: any((p) => (p.currentOpeningHours as { openNow?: boolean } | undefined)?.openNow !== undefined),
      priceLevel: any((p) => p.priceLevel !== undefined),
      phone: any((p) => !!p.nationalPhoneNumber),
      website: any((p) => !!p.websiteUri),
    };

    return NextResponse.json({
      ok: true,
      keyConfigured: true,
      placesApiOk: true,
      sampleCount: places.length,
      fields,
      note: "priceLevel is often absent for salons even when supported — that's expected.",
      checkedAt: new Date().toISOString(),
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, keyConfigured: true, placesApiOk: false, message: err instanceof Error ? err.message : "fetch failed" },
      { status: 502 }
    );
  }
}
