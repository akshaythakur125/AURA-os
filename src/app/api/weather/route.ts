import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Today's weather + sun times for the Daily Aura Brief. Uses Open-Meteo — free,
 * keyless, no attribution headache — so the ecosystem's daily companion works
 * out of the box. Proxied server-side to dodge CORS and to cache lightly. Given
 * lat/lng, returns the one current temp, a condition label, today's sunrise/
 * sunset (local), and the max UV.
 */
const WMO: Record<number, string> = {
  0: "Clear", 1: "Mostly clear", 2: "Partly cloudy", 3: "Overcast",
  45: "Fog", 48: "Fog", 51: "Light drizzle", 53: "Drizzle", 55: "Heavy drizzle",
  61: "Light rain", 63: "Rain", 65: "Heavy rain", 66: "Freezing rain", 67: "Freezing rain",
  71: "Light snow", 73: "Snow", 75: "Heavy snow", 77: "Snow grains",
  80: "Showers", 81: "Showers", 82: "Heavy showers", 85: "Snow showers", 86: "Snow showers",
  95: "Thunderstorm", 96: "Thunderstorm", 99: "Thunderstorm",
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = parseFloat(searchParams.get("lat") || "");
  const lng = parseFloat(searchParams.get("lng") || "");
  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    return NextResponse.json({ error: "lat and lng are required" }, { status: 400 });
  }

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,weather_code&daily=sunrise,sunset,uv_index_max&timezone=auto&forecast_days=1`;
    const res = await fetch(url, { next: { revalidate: 1800 } });
    if (!res.ok) return NextResponse.json({ error: "weather_unavailable" }, { status: 502 });
    const d = (await res.json()) as {
      current?: { temperature_2m?: number; weather_code?: number };
      daily?: { sunrise?: string[]; sunset?: string[]; uv_index_max?: number[] };
    };
    const code = d.current?.weather_code ?? 0;
    return NextResponse.json({
      tempC: typeof d.current?.temperature_2m === "number" ? Math.round(d.current.temperature_2m) : null,
      code,
      label: WMO[code] || "—",
      sunrise: d.daily?.sunrise?.[0] || null,
      sunset: d.daily?.sunset?.[0] || null,
      uvMax: typeof d.daily?.uv_index_max?.[0] === "number" ? Math.round(d.daily.uv_index_max[0]) : null,
    });
  } catch {
    return NextResponse.json({ error: "fetch_failed" }, { status: 502 });
  }
}
