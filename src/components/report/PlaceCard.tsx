"use client";

import { useState } from "react";

export interface Place {
  name: string;
  type?: string;
  area: string;
  rating: number;
  totalRatings?: number;
  photoReference?: string | null;
  mapUrl: string;
  openNow?: boolean | null;
  priceLevel?: number | null;
  phone?: string | null;
  website?: string | null;
  summary?: string | null;
}

function priceLabel(level?: number | null): string | null {
  if (level == null || level <= 0) return null;
  return "₹".repeat(Math.min(4, level));
}

/** One nearby place, rendered proper-app style: photo, rating+reviews, price,
 * open-now, editorial blurb, and Directions / Call / Website actions. Shared by
 * the concierge and the local-services cards so they stay consistent. */
export function PlaceCard({ p }: { p: Place }) {
  const [imgOk, setImgOk] = useState(true);
  const photoUrl = p.photoReference ? `/api/places/photo?name=${encodeURIComponent(p.photoReference)}` : null;
  const price = priceLabel(p.priceLevel);
  return (
    <div className="flex gap-3 rounded-lg border border-[#1c1917]/[0.08] bg-white/70 p-2">
      {photoUrl && imgOk ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={photoUrl} alt="" loading="lazy" onError={() => setImgOk(false)} className="h-16 w-16 shrink-0 rounded-md object-cover" />
      ) : (
        <div className="grid h-16 w-16 shrink-0 place-items-center rounded-md bg-[#1c1917]/[0.05] text-lg">📍</div>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <p className="truncate text-xs font-bold text-[#1C1917]">{p.name}</p>
          {p.type && <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wide text-[#B23A25]">{p.type}</span>}
        </div>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px]">
          {p.rating > 0 && (
            <span className="font-semibold text-amber-500">★ {p.rating.toFixed(1)}{p.totalRatings ? <span className="font-normal text-[#857b6e]"> ({p.totalRatings.toLocaleString("en-IN")})</span> : null}</span>
          )}
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
}
