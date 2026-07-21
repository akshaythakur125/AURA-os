"use client";

import { Scene3DAccent } from "@/components/hero/Scene3DAccent";
import type { GroomingResult } from "@/lib/aura-engine/engines/groomingEngine";

export interface NearbyPlace {
  name: string;
  type: string;
  area: string;
  rating: number;
  mapUrl: string;
}

interface Props {
  grooming?: Partial<GroomingResult>;
  /** Fallback hair-neatness (0-100) from imageMetrics when grooming is absent. */
  hairNeatnessFallback?: number;
  places: { salons: NearbyPlace[]; photographers: NearbyPlace[]; gyms: NearbyPlace[] };
  city?: string;
  /** True once we've requested geolocation (so we can distinguish "denied" from "loading"). */
  locationKnown: boolean;
}

function verdict(score: number): { word: string; tone: string } {
  if (score >= 75) return { word: "Strong", tone: "text-emerald-600" };
  if (score >= 55) return { word: "Decent", tone: "text-amber-600" };
  return { word: "Needs work", tone: "text-[#E14434]" };
}

function hairComment(score: number): string {
  if (score >= 75)
    return "Your hair reads clean and intentional. Keep the shape fresh with a trim every 3–4 weeks and a light matte product so it never falls flat on camera.";
  if (score >= 55)
    return "Your hairstyle is working but a little soft at the edges. Ask for a defined shape-up and style it off your forehead with a matte clay — structure around the face instantly sharpens your look.";
  return "Hair is your fastest win. Book a proper shape-up, then style upward and off the forehead with a matte paste (never shiny gel). A clean, structured cut is the single biggest jump in how put-together you read.";
}

function skinComment(score: number): string {
  if (score >= 75) return "Skin looks even and well-lit — maintain with a daily moisturizer + SPF.";
  if (score >= 55) return "Even out shine with a mattifying moisturizer and shoot in soft, indirect light.";
  return "Hydrate morning and night and avoid harsh overhead light — even skin tone reads as health and care.";
}

function facialHairComment(score: number): string {
  if (score >= 75) return "Facial hair is well-defined. Keep the neckline and cheek lines sharp.";
  if (score >= 55) return "Tidy the edges — a defined neckline and cheek line makes even light stubble look deliberate.";
  return "Either keep it clean-shaven or commit to a defined, trimmed shape. Undefined edges read as unkempt.";
}

function Bar({ label, score, tip }: { label: string; score: number; tip: string }) {
  const v = verdict(score);
  return (
    <div className="rounded-xl border border-[#1c1917]/[0.08] bg-[#1c1917]/[0.02] p-3">
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-xs font-semibold text-[#1C1917]">{label}</span>
        <span className={`text-[11px] font-medium ${v.tone}`}>{v.word} · {Math.round(score)}</span>
      </div>
      <div className="mb-2 h-1.5 overflow-hidden rounded-full bg-[#1c1917]/[0.06]">
        <div className="h-full rounded-full bg-gradient-to-r from-[#E14434] to-[#c0341f]" style={{ width: `${Math.max(4, Math.min(100, score))}%` }} />
      </div>
      <p className="text-[11px] leading-relaxed text-[#6f675e]">{tip}</p>
    </div>
  );
}

function PlaceRow({ p }: { p: NearbyPlace }) {
  return (
    <a
      href={p.mapUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-between gap-3 rounded-xl border border-[#1c1917]/10 bg-[#1c1917]/[0.02] px-3.5 py-2.5 transition-colors hover:border-[#E14434]/30 hover:bg-[#1c1917]/[0.04]"
    >
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-[#1C1917]">{p.name}</p>
        <p className="truncate text-[11px] text-[#9c9184]">{p.area}</p>
      </div>
      <div className="shrink-0 text-right">
        {p.rating > 0 && <p className="text-xs font-medium text-amber-500">★ {p.rating.toFixed(1)}</p>}
        <p className="text-[10px] text-[#857b6e]">Open in Maps →</p>
      </div>
    </a>
  );
}

function PlaceGroup({ emoji, title, places }: { emoji: string; title: string; places: NearbyPlace[] }) {
  if (!places || places.length === 0) return null;
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#857b6e]">
        {emoji} {title}
      </p>
      <div className="space-y-2">
        {places.slice(0, 4).map((p, i) => (
          <PlaceRow key={p.name + i} p={p} />
        ))}
      </div>
    </div>
  );
}

export function GroomingLocalCard({ grooming, hairNeatnessFallback, places, city, locationKnown }: Props) {
  const hair = grooming?.hairNeatness ?? hairNeatnessFallback ?? 50;
  const skin = grooming?.skinClarity ?? 55;
  const beard = grooming?.facialHair ?? 60;

  const totalPlaces = places.salons.length + places.photographers.length + places.gyms.length;

  return (
    <div className="rounded-2xl border border-[#1c1917]/[0.08] bg-gradient-to-b from-[#1c1917]/[0.03] to-transparent p-5 sm:p-6">
      {/* Header with 3D style icon */}
      <div className="mb-5 flex flex-col items-center gap-3 text-center sm:flex-row sm:text-left">
        <div className="shrink-0">
          <Scene3DAccent size={96} shape="model" />
        </div>
        <div>
          <h3 className="text-base font-bold text-[#1C1917]">Grooming, Hair &amp; Your Close-Up</h3>
          <p className="mt-1 text-xs text-[#6f675e]">
            {grooming?.assessment || "A sharper grooming game is the fastest, cheapest jump in how put-together you read."}
          </p>
        </div>
      </div>

      {/* Hairstyle note — the headline comment */}
      <div className="mb-4 rounded-xl border border-[#E14434]/15 bg-[#E14434]/[0.05] p-4">
        <p className="mb-1 text-xs font-semibold text-[#B23A25]">💈 Your hairstyle</p>
        <p className="text-xs leading-relaxed text-[#4a443d]">{hairComment(hair)}</p>
      </div>

      {/* Grooming breakdown */}
      <div className="mb-5 grid gap-2.5 sm:grid-cols-3">
        <Bar label="Hair" score={hair} tip={hairComment(hair).split(".")[0] + "."} />
        <Bar label="Skin" score={skin} tip={skinComment(skin)} />
        <Bar label="Facial hair" score={beard} tip={facialHairComment(beard)} />
      </div>

      {/* Nearby pros */}
      <div>
        <p className="mb-3 text-sm font-semibold text-[#1C1917]">
          Get it done near {city || "you"}
          {totalPlaces > 0 && <span className="ml-1 text-xs font-normal text-[#9c9184]">· {totalPlaces} spots</span>}
        </p>
        {totalPlaces > 0 ? (
          <div className="space-y-4">
            <PlaceGroup emoji="💈" title="Salons & Grooming" places={places.salons} />
            <PlaceGroup emoji="📸" title="Photographers" places={places.photographers} />
            <PlaceGroup emoji="🏋️" title="Gyms & Fitness" places={places.gyms} />
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-[#1c1917]/15 bg-[#1c1917]/[0.02] px-4 py-5 text-center">
            <p className="text-xs text-[#857b6e]">
              {locationKnown
                ? "No nearby pros found right now — try again shortly."
                : "Allow location access to see top-rated salons, photographers, and gyms near you."}
            </p>
          </div>
        )}
        <p className="mt-3 text-[10px] text-[#9c9184]">
          Places are pulled live from Google Maps by rating near your location. FixMyAura doesn&apos;t endorse specific businesses.
        </p>
      </div>
    </div>
  );
}
