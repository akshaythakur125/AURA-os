"use client";

import { useRef, useState } from "react";
import { statsFromImageData, buildGridCheck, type TileStats, type GridCheckResult } from "@/lib/insta/gridCheck";
import { checkInstaBio } from "@/lib/insta/bioCheck";

type Tile = { src: string; stats: TileStats };
const SAMPLE = 160; // px edge we sample each tile at for stats

async function readTile(file: File): Promise<Tile | null> {
  const src = await new Promise<string>((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result as string);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
  const img = await new Promise<HTMLImageElement | null>((res) => {
    const i = new Image();
    i.onload = () => res(i);
    i.onerror = () => res(null);
    i.src = src;
  });
  if (!img) return null;
  const c = document.createElement("canvas");
  c.width = SAMPLE; c.height = SAMPLE;
  const ctx = c.getContext("2d");
  if (!ctx) return null;
  ctx.drawImage(img, 0, 0, SAMPLE, SAMPLE);
  try {
    const id = ctx.getImageData(0, 0, SAMPLE, SAMPLE);
    return { src, stats: statsFromImageData(id.data, SAMPLE, SAMPLE) };
  } catch {
    return null;
  }
}

function ScoreRing({ value }: { value: number }) {
  const tone = value >= 78 ? "#16a34a" : value >= 58 ? "#E14434" : "#B23A25";
  return (
    <div className="relative grid h-16 w-16 shrink-0 place-items-center rounded-full" style={{ background: `conic-gradient(${tone} ${value * 3.6}deg, rgba(28,25,23,0.08) 0deg)` }}>
      <div className="grid h-12 w-12 place-items-center rounded-full bg-[#FBF8F2]">
        <span className="text-sm font-bold text-[#1C1917]">{value}</span>
      </div>
    </div>
  );
}

/**
 * Grid Check — pick your recent posts, see them as a real Instagram grid with a
 * mock profile header, and get the whole profile scored the way a visitor reads
 * it: cohesion, the weak-link tile, which shot should lead, and the palette.
 * No login, no password — everything runs in the browser.
 */
export function GridCheck() {
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [handle, setHandle] = useState("@yourhandle");
  const [bio, setBio] = useState("");
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const result: GridCheckResult | null = tiles.length >= 1 ? buildGridCheck(tiles.map((t) => t.stats)) : null;
  const bioResult = bio.trim() ? checkInstaBio(bio) : null;

  async function onFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setBusy(true);
    const picked = Array.from(files).slice(0, 9 - tiles.length);
    const read = (await Promise.all(picked.map(readTile))).filter(Boolean) as Tile[];
    setTiles((prev) => [...prev, ...read].slice(0, 9));
    setBusy(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  function moveLeadFirst() {
    if (!result) return;
    setTiles((prev) => {
      const i = result.leadIndex;
      if (i <= 0) return prev;
      const copy = [...prev];
      const [lead] = copy.splice(i, 1);
      copy.unshift(lead);
      return copy;
    });
  }

  return (
    <div className="rounded-2xl border border-[#1c1917]/[0.08] bg-gradient-to-b from-[#1c1917]/[0.03] to-transparent p-5 sm:p-6">
      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#B23A25]">Instagram Grid Check</p>
      <h3 className="mt-0.5 text-base font-bold text-[#1C1917]">See &amp; score your whole profile, not one photo</h3>
      <p className="mt-1 text-xs text-[#6f675e]">Add your recent posts and we render your grid exactly as a visitor sees it — then score how it reads in the first two seconds. No login, and we never ask for your Instagram password.</p>

      {/* Add photos */}
      <div className="mt-4">
        <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => onFiles(e.target.files)} />
        <button
          onClick={() => inputRef.current?.click()}
          disabled={busy || tiles.length >= 9}
          className="w-full rounded-xl bg-gradient-to-r from-[#E14434] to-[#c0341f] px-4 py-2.5 text-xs font-semibold text-white transition-transform hover:-translate-y-0.5 disabled:opacity-60"
        >
          {busy ? "Reading your posts…" : tiles.length === 0 ? "✨ Add your recent posts (up to 9)" : tiles.length >= 9 ? "Grid full (9/9)" : `Add more (${tiles.length}/9)`}
        </button>
      </div>

      {tiles.length > 0 && (
        <>
          {/* Mock IG profile */}
          <div className="mt-4 rounded-xl border border-[#1c1917]/[0.08] bg-white/70 p-3.5">
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={tiles[result?.leadIndex ?? 0].src} alt="Profile avatar" className="h-14 w-14 rounded-full border-2 border-[#E14434]/40 object-cover" />
              <div className="min-w-0 flex-1">
                <input
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  className="w-full bg-transparent text-sm font-bold text-[#1C1917] outline-none"
                  aria-label="Your handle"
                />
                <p className="text-[11px] text-[#857b6e]">{tiles.length} posts · your grid preview</p>
              </div>
            </div>
            {/* Bio — paste yours to score the copy too */}
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Paste your Instagram bio here to score it too…"
              rows={2}
              className="mt-2.5 w-full resize-none rounded-lg border border-[#1c1917]/10 bg-[#fbf8f2]/70 p-2.5 text-xs text-[#33302b] outline-none placeholder:text-[#9c9184] focus:border-[#E14434]/40"
            />
            {bio.trim() && <p className="mt-0.5 text-right text-[10px] text-[#9c9184]">{bio.trim().length}/150</p>}
            {/* The grid */}
            <div className="mt-3 grid grid-cols-3 gap-1">
              {tiles.map((t, i) => (
                <div key={i} className="relative aspect-square overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={t.src} alt={`Post ${i + 1}`} className="h-full w-full object-cover" />
                  {result?.leadIndex === i && <span className="absolute left-1 top-1 rounded bg-[#E14434] px-1 py-0.5 text-[9px] font-bold text-white">★ LEAD</span>}
                  {result?.weakIndex === i && result.weakIndex !== result.leadIndex && <span className="absolute left-1 top-1 rounded bg-[#1c1917]/80 px-1 py-0.5 text-[9px] font-bold text-white">⚠ WEAK</span>}
                  <span className="absolute bottom-1 right-1 rounded bg-black/50 px-1 text-[9px] font-semibold text-white">{i + 1}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Score + verdict */}
          {result && tiles.length >= 3 && (
            <div className="mt-4 space-y-3">
              <div className="flex items-center gap-3 rounded-xl border border-[#1c1917]/[0.08] bg-white/60 p-3.5">
                <ScoreRing value={result.cohesion} />
                <div>
                  <p className="text-xs font-bold text-[#1C1917]">Grid cohesion — {result.cohesionLabel}</p>
                  <p className="mt-0.5 text-[11px] text-[#4a443d]">{result.verdict}</p>
                  <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-[#857b6e]">Palette: {result.palette}</p>
                </div>
              </div>

              <div className="space-y-1.5">
                {result.tips.map((t, i) => (
                  <div key={i} className="flex items-start gap-2 rounded-lg border border-[#1c1917]/[0.06] bg-white/50 p-2.5 text-xs text-[#4a443d]">
                    <span className="mt-px flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#E14434]/15 text-[10px] text-[#E14434]">→</span>
                    {t}
                  </div>
                ))}
              </div>

              {result.leadIndex > 0 && (
                <button onClick={moveLeadFirst} className="text-[11px] font-semibold text-[#B23A25] hover:underline">
                  ↦ Move your best shot to top-left
                </button>
              )}
            </div>
          )}

          {/* Bio critique */}
          {bioResult && (
            <div className="mt-3 space-y-3">
              <div className="flex items-center gap-3 rounded-xl border border-[#1c1917]/[0.08] bg-white/60 p-3.5">
                <ScoreRing value={bioResult.score} />
                <div>
                  <p className="text-xs font-bold text-[#1C1917]">Bio — {bioResult.label}</p>
                  <p className="mt-0.5 text-[11px] text-[#4a443d]">{bioResult.rewriteHint}</p>
                </div>
              </div>
              <div className="space-y-1.5">
                {bioResult.notes.map((nt, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-[#4a443d]">
                    <span className={`mt-px flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] ${nt.ok ? "bg-emerald-500/15 text-emerald-700" : "bg-[#E14434]/15 text-[#E14434]"}`}>{nt.ok ? "✓" : "!"}</span>
                    {nt.text}
                  </div>
                ))}
              </div>
            </div>
          )}
          {tiles.length < 3 && <p className="mt-3 text-[11px] text-[#857b6e]">Add at least 3 posts to score how your grid reads as a whole.</p>}
          <button onClick={() => setTiles([])} className="mt-3 block text-[11px] text-[#857b6e] underline hover:text-[#1C1917]">Clear &amp; start over</button>
        </>
      )}
    </div>
  );
}
