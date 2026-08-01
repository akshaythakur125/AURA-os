/**
 * Daily Aura Brief — the ecosystem's living daily companion. Takes today's
 * weather + sun times and the person's own traits and produces one contextual
 * plan: what to wear (their palette, weather-appropriate), the grooming nudge
 * that matters today (SPF on a high-UV day), and the exact golden-hour windows
 * to shoot a photo in — so any reshoot lands in flattering light. Pure and
 * deterministic; the freshness comes from the weather, so there's a real reason
 * to open it every day.
 */

export interface Weather {
  tempC: number | null;
  code: number;
  label: string;
  sunrise: string | null; // ISO local, e.g. 2026-08-01T06:12
  sunset: string | null;
  uvMax: number | null;
}

export interface BriefTraits {
  powerColors?: string[];
  neutralDark?: string;   // for layering copy
  oily?: boolean;
  gender?: "men" | "women" | "unisex";
}

export interface DailyBrief {
  weatherLine: string;
  outfit: string;
  grooming: string;
  goldenAm: string | null;
  goldenPm: string | null;
  photoLine: string;
}

function fmt(iso: string, addMin: number): string {
  // iso like "2026-08-01T06:12"; parse local wall-clock, add minutes, format 12h.
  const m = iso.match(/T(\d{2}):(\d{2})/);
  if (!m) return "";
  let total = parseInt(m[1], 10) * 60 + parseInt(m[2], 10) + addMin;
  total = ((total % 1440) + 1440) % 1440;
  let h = Math.floor(total / 60);
  const min = total % 60;
  const ap = h >= 12 ? "pm" : "am";
  h = h % 12 || 12;
  return `${h}:${min.toString().padStart(2, "0")}${ap}`;
}

const art = (w: string) => (/^[aeiou]/i.test(w.trim()) ? "an" : "a");
const isRain = (c: number) => (c >= 51 && c <= 67) || (c >= 80 && c <= 82) || (c >= 95);
const isSnow = (c: number) => (c >= 71 && c <= 77) || c === 85 || c === 86;
const isClear = (c: number) => c <= 1;

export function buildDailyBrief(w: Weather, t: BriefTraits): DailyBrief {
  const p1 = (t.powerColors?.[0] || "").toLowerCase();
  const p2 = (t.powerColors?.[1] || "").toLowerCase();
  const dark = (t.neutralDark || "charcoal").toLowerCase();
  const temp = w.tempC;
  const colour = p1 || "one of your palette colours";

  const weatherLine = temp != null ? `${w.label}, ${temp}°C` : w.label;

  // Weather-appropriate outfit from their palette.
  let outfit: string;
  if (isRain(w.code)) {
    outfit = `Rain around — lean dark (${dark} hides splashes), bring your layer, and skip suede. ${art(colour).charAt(0).toUpperCase()+art(colour).slice(1)} ${colour} tee underneath keeps it you.`;
  } else if (isSnow(w.code)) {
    outfit = `Cold and wet — layer up over ${art(colour)} ${colour} base and keep footwear practical.`;
  } else if (temp != null && temp >= 30) {
    outfit = `Hot one (${temp}°) — go light and breathable in ${colour}${p2 ? ` or ${p2}` : ""}, and lose the jacket.`;
  } else if (temp != null && temp <= 18) {
    outfit = `Cooler today (${temp}°) — layer your ${dark} overshirt over ${art(colour)} ${colour} tee; this is peak layering weather for your look.`;
  } else {
    outfit = `Mild and easy — perfect ${colour} shirt weather. Carry the layer for the evening.`;
  }

  // The grooming nudge that actually matters today.
  let grooming: string;
  if ((w.uvMax != null && w.uvMax >= 6) || isClear(w.code)) {
    grooming = `${w.uvMax != null && w.uvMax >= 8 ? "Very high" : "High"} UV today${w.uvMax != null ? ` (index ${w.uvMax})` : ""} — sunscreen before you step out is non-negotiable; it's the cheapest anti-ageing move there is.`;
  } else if (t.oily && (isRain(w.code) || (temp != null && temp >= 28))) {
    grooming = "Humid out — carry blotting sheets and go matte, so you don't read shiny by midday.";
  } else if (temp != null && temp <= 15) {
    grooming = "Dry, cold air — moisturise well morning and night so skin doesn't look tired or flaky.";
  } else {
    grooming = "Baseline day — cleanser, moisturiser and SPF is all it takes to keep skin camera-ready.";
  }

  // Golden hour: ~30–90 min after sunrise, ~90–20 min before sunset.
  const goldenAm = w.sunrise ? `${fmt(w.sunrise, 30)}–${fmt(w.sunrise, 90)}` : null;
  const goldenPm = w.sunset ? `${fmt(w.sunset, -90)}–${fmt(w.sunset, -20)}` : null;
  const photoLine = goldenPm
    ? `Shooting anything today? The light is best ${goldenAm ? `at ${goldenAm} and ` : ""}${goldenPm} — soft, warm, and forgiving.`
    : "Shoot facing a window in daytime for the softest, most flattering light.";

  return { weatherLine, outfit, grooming, goldenAm, goldenPm, photoLine };
}
