"use client";

import { useEffect, useState } from "react";
import { buildDatePlaybook, mapSearchLink } from "@/lib/dining/dateSpots";

interface Place {
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

function priceLabel(level: number | null): string | null {
  if (level == null) return null;
  return level === 0 ? "Free" : "₹".repeat(Math.min(4, level));
}

/** Live Google Places results for one venue query — fetched on demand. */
function RealSpots({ query, city }: { query: string; city: string }) {
  const [state, setState] = useState<"loading" | "done" | "empty" | "unconfigured" | "error">("loading");
  const [places, setPlaces] = useState<Place[]>([]);

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const res = await fetch(`/api/places/search?query=${encodeURIComponent(query)}&city=${encodeURIComponent(city)}`);
        if (!live) return;
        if (res.status === 503) { setState("unconfigured"); return; }
        if (!res.ok) { setState("error"); return; }
        const data = await res.json();
        const list: Place[] = (data.places || []).slice(0, 3);
        setPlaces(list);
        setState(list.length ? "done" : "empty");
      } catch {
        if (live) setState("error");
      }
    })();
    return () => { live = false; };
  }, [query, city]);

  if (state === "loading") return <p className="mt-2 text-[11px] text-[#857b6e]">Finding real spots near {city}…</p>;
  if (state === "unconfigured" || state === "error" || state === "empty") {
    return (
      <a href={mapSearchLink(query, city || undefined)} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-[11px] font-semibold text-[#B23A25] hover:underline">
        📍 Search {city ? `in ${city}` : "near me"} on Google Maps →
      </a>
    );
  }

  return (
    <div className="mt-2.5 space-y-2">
      {places.map((p) => {
        const price = priceLabel(p.priceLevel);
        return (
          <div key={p.name + p.area} className="flex gap-3 rounded-lg border border-[#1c1917]/[0.08] bg-white/70 p-2">
            {p.photoReference ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={`/api/places/photo?name=${encodeURIComponent(p.photoReference)}`} alt={p.name} className="h-16 w-16 shrink-0 rounded-md object-cover" loading="lazy" />
            ) : (
              <div className="grid h-16 w-16 shrink-0 place-items-center rounded-md bg-[#1c1917]/[0.05] text-lg">📍</div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-[#1C1917]">{p.name}</p>
              <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px]">
                {p.rating > 0 && <span className="font-semibold text-[#1C1917]">★ {p.rating.toFixed(1)} <span className="font-normal text-[#857b6e]">({p.totalRatings.toLocaleString("en-IN")})</span></span>}
                {price && <span className="text-[#857b6e]">{price}</span>}
                {p.openNow === true && <span className="font-semibold text-emerald-600">Open now</span>}
                {p.openNow === false && <span className="text-[#9c9184]">Closed</span>}
              </div>
              <p className="mt-0.5 truncate text-[11px] text-[#857b6e]">{p.summary || p.area}</p>
              <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] font-semibold">
                <a href={p.mapUrl} target="_blank" rel="noopener noreferrer" className="text-[#B23A25] hover:underline">Directions →</a>
                {p.phone && <a href={`tel:${p.phone.replace(/\s/g, "")}`} className="text-[#4a443d] hover:underline">Call</a>}
                {p.website && <a href={p.website} target="_blank" rel="noopener noreferrer" className="text-[#4a443d] hover:underline">Website</a>}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Date & Dining Playbook — where to go, what to order, when, and what to wear
 * (from the user's own colours). With a city entered, each spot pulls REAL
 * venues from Google Places (photo, rating, price, open-now, directions);
 * without a key it falls back to a Google-Maps search link.
 */
export function DateSpotsCard({ budget, powerColors }: { budget?: number; powerColors?: string[] }) {
  const [city, setCity] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const plan = buildDatePlaybook({ budget, powerColors, city: city.trim() || undefined });
  const trimmedCity = city.trim();

  return (
    <div className="rounded-2xl border border-[#1c1917]/[0.08] bg-gradient-to-b from-[#1c1917]/[0.03] to-transparent p-5 sm:p-6">
      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#B23A25]">Date &amp; Dining Playbook</p>
      <h3 className="mt-0.5 text-base font-bold text-[#1C1917]">Where to take them — and what to order</h3>
      <p className="mt-1 text-xs text-[#6f675e]">Budget-smart, first-date-tested spots, with what to order and when to go. Add your city and we pull real, top-rated places nearby.</p>

      <input
        value={city}
        onChange={(e) => setCity(e.target.value)}
        placeholder="Your city (e.g. Bangalore) — for real nearby spots"
        className="mt-3 w-full rounded-lg border border-[#1c1917]/10 bg-[#fbf8f2]/70 px-3 py-2 text-xs text-[#33302b] outline-none placeholder:text-[#9c9184] focus:border-[#E14434]/40"
      />

      <div className="mt-4 space-y-2.5">
        {plan.spots.map((s) => (
          <div key={s.type} className="rounded-xl border border-[#1c1917]/[0.06] bg-white/50 p-3.5">
            <div className="flex items-start justify-between gap-2">
              <p className="text-xs font-bold text-[#1C1917]">{s.emoji} {s.type}</p>
              <span className="shrink-0 text-[10px] font-semibold text-[#857b6e]">{s.cost}</span>
            </div>
            <p className="mt-0.5 text-[11px] text-[#4a443d]">{s.idea}</p>
            <p className="mt-1.5 text-[11px] text-[#33302b]"><span className="font-semibold">Order:</span> {s.order} · <span className="font-semibold">Best time:</span> {s.timing}</p>
            {open === s.type ? (
              <RealSpots query={s.query} city={trimmedCity} />
            ) : (
              <button
                onClick={() => setOpen(s.type)}
                className="mt-1.5 inline-block text-[11px] font-semibold text-[#B23A25] hover:underline"
              >
                📍 Find {s.type.toLowerCase()} spots near {trimmedCity || "me"} →
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 space-y-2">
        <div className="rounded-xl border border-[#E14434]/20 bg-[#E14434]/[0.06] p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-[#B23A25]">The first move</p>
          <p className="text-xs text-[#33302b]">{plan.firstMove}</p>
        </div>
        <div className="rounded-xl border border-[#1c1917]/[0.06] bg-white/50 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-[#857b6e]">What to wear</p>
          <p className="text-xs text-[#33302b]">{plan.wear}</p>
        </div>
      </div>
      <p className="mt-3 text-[11px] text-[#9c9184]">💡 {plan.note}</p>
    </div>
  );
}
