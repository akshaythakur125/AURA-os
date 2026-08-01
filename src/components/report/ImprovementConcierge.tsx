"use client";

import { useState } from "react";
import { conciergeCategories, type ConciergeInput, type ProviderCategory } from "@/lib/local/improvementCategories";
import { PlaceCard, type Place } from "@/components/report/PlaceCard";

type CatState = { state: "loading" | "done" | "empty" | "error"; places: Place[] };

function mapsSearch(query: string, near: string): string {
  return `https://www.google.com/maps/search/${encodeURIComponent(`${query} near ${near || "me"}`)}`;
}

/**
 * Get It Done Near You — the concierge that turns the whole report into a
 * booking list. The user enters their address once; we geocode it and pull real
 * nearby providers for every improvement (salon, derma, tailor, optician, photo
 * studio, gym, fragrance, cafés), weakest-area first. Address + key are handled
 * server-side; without a key it falls back to Google-Maps search links.
 */
export function ImprovementConcierge(input: ConciergeInput) {
  const categories = conciergeCategories(input);
  const [address, setAddress] = useState("");
  const [status, setStatus] = useState<"idle" | "locating" | "ready" | "unconfigured" | "error">("idle");
  const [near, setNear] = useState("");
  const [results, setResults] = useState<Record<string, CatState>>({});

  async function fetchAll(lat: number, lng: number) {
    setStatus("ready");
    for (const c of categories) {
      setResults((r) => ({ ...r, [c.id]: { state: "loading", places: [] } }));
      fetch(`/api/places/nearby?lat=${lat}&lng=${lng}&radius=6000&type=${encodeURIComponent(c.query)}`)
        .then((res) => (res.ok ? res.json() : Promise.reject()))
        .then((data) => {
          const places: Place[] = (data.places || []).slice(0, 4);
          setResults((r) => ({ ...r, [c.id]: { state: places.length ? "done" : "empty", places } }));
        })
        .catch(() => setResults((r) => ({ ...r, [c.id]: { state: "error", places: [] } })));
    }
  }

  async function fromAddress() {
    if (!address.trim()) return;
    setStatus("locating");
    try {
      const res = await fetch(`/api/places/geocode?address=${encodeURIComponent(address.trim())}`);
      if (res.status === 503) { setStatus("unconfigured"); setNear(address.trim()); return; }
      if (!res.ok) { setStatus("error"); return; }
      const data = await res.json();
      setNear(data.formatted || address.trim());
      fetchAll(data.lat, data.lng);
    } catch {
      setStatus("error");
    }
  }

  function fromGeolocation() {
    if (!navigator.geolocation) return;
    setStatus("locating");
    navigator.geolocation.getCurrentPosition(
      (pos) => { setNear("your location"); fetchAll(pos.coords.latitude, pos.coords.longitude); },
      () => setStatus("error"),
      { timeout: 8000 },
    );
  }

  return (
    <div className="rounded-2xl border border-[#E14434]/20 bg-gradient-to-b from-[#E14434]/[0.05] to-transparent p-5 sm:p-6">
      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#B23A25]">Get It Done Near You</p>
      <h3 className="mt-0.5 text-base font-bold text-[#1C1917]">Your whole glow-up, booked nearby</h3>
      <p className="mt-1 text-xs text-[#6f675e]">Enter your area and we&apos;ll pull the real, top-rated places that can do each thing on your list for you — salon, skin, tailor, eyewear, photos, gym and more.</p>

      {/* Address entry */}
      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <input
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && fromAddress()}
          placeholder="Your area or address (e.g. Koramangala, Bangalore)"
          className="flex-1 rounded-lg border border-[#1c1917]/10 bg-[#fbf8f2]/70 px-3 py-2 text-xs text-[#33302b] outline-none placeholder:text-[#9c9184] focus:border-[#E14434]/40"
        />
        <button onClick={fromAddress} disabled={status === "locating" || !address.trim()} className="rounded-lg bg-gradient-to-r from-[#E14434] to-[#c0341f] px-4 py-2 text-xs font-semibold text-white transition-transform hover:-translate-y-0.5 disabled:opacity-60">
          {status === "locating" ? "Finding…" : "Find everything near me"}
        </button>
      </div>
      <button onClick={fromGeolocation} className="mt-1.5 text-[11px] font-semibold text-[#857b6e] hover:text-[#1C1917] hover:underline">or use my current location →</button>

      {status === "error" && <p className="mt-2 text-[11px] text-[#B23A25]">Couldn&apos;t find that area — try a nearby landmark or city name.</p>}

      {/* Not configured — graceful fallback to maps searches */}
      {status === "unconfigured" && (
        <div className="mt-4 space-y-2">
          <p className="text-[11px] text-[#857b6e]">Live places aren&apos;t switched on yet — here&apos;s a direct Maps search for each:</p>
          {categories.map((c) => (
            <a key={c.id} href={mapsSearch(c.query, near)} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between rounded-lg border border-[#1c1917]/[0.08] bg-white/50 p-2.5 text-xs hover:border-[#E14434]/30">
              <span className="font-semibold text-[#1C1917]">{c.emoji} {c.label}</span>
              <span className="font-semibold text-[#B23A25]">Search Maps →</span>
            </a>
          ))}
        </div>
      )}

      {/* Results */}
      {status === "ready" && (
        <div className="mt-4">
          {near && <p className="mb-3 text-[11px] text-[#857b6e]">Showing top-rated spots near <span className="font-semibold text-[#1C1917]">{near}</span>, biggest opportunity first.</p>}
          <div className="space-y-4">
            {categories.map((c) => (
              <CategoryBlock key={c.id} cat={c} data={results[c.id]} near={near} />
            ))}
          </div>
          <p className="mt-3 text-[10px] text-[#9c9184]">Places are pulled live from Google Maps by rating. FixMyAura doesn&apos;t endorse specific businesses.</p>
        </div>
      )}
    </div>
  );
}

function CategoryBlock({ cat, data, near }: { cat: ProviderCategory; data?: CatState; near: string }) {
  return (
    <div>
      <div className="mb-1.5">
        <p className="text-xs font-bold text-[#1C1917]">{cat.emoji} {cat.label}</p>
        <p className="text-[11px] text-[#857b6e]">{cat.need}</p>
      </div>
      {!data || data.state === "loading" ? (
        <p className="text-[11px] text-[#9c9184]">Finding the best near you…</p>
      ) : data.state === "done" ? (
        <div className="space-y-2">
          {data.places.map((p) => <PlaceCard key={p.name + p.area} p={p} />)}
        </div>
      ) : (
        <a href={mapsSearch(cat.query, near)} target="_blank" rel="noopener noreferrer" className="text-[11px] font-semibold text-[#B23A25] hover:underline">Search {cat.label.toLowerCase()} on Maps →</a>
      )}
    </div>
  );
}
