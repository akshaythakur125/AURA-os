"use client";

import { useState } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { rankProfilePhotos, type RankedPhoto } from "@/lib/vision/photoRanker";

type State = "idle" | "reading" | "ranking" | "done" | "unavailable" | "error";

const ROLE_STYLE: Record<RankedPhoto["role"], { label: string; cls: string }> = {
  lead: { label: "★ Lead photo", cls: "bg-[#E14434] text-white" },
  supporting: { label: "Supporting", cls: "bg-[#1c1917]/[0.08] text-[#4a443d]" },
  cut: { label: "Cut / reshoot", cls: "bg-[#1c1917]/70 text-white" },
};

export default function PhotoRankerPage() {
  const [state, setState] = useState<State>("idle");
  const [ranked, setRanked] = useState<RankedPhoto[] | null>(null);

  async function onFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setState("reading");
    setRanked(null);
    try {
      const imgs = await Promise.all(
        Array.from(files).slice(0, 8).map(
          (f) =>
            new Promise<string>((resolve, reject) => {
              const r = new FileReader();
              r.onload = () => resolve(r.result as string);
              r.onerror = reject;
              r.readAsDataURL(f);
            }),
        ),
      );
      setState("ranking");
      const result = await rankProfilePhotos(imgs);
      if (!result) { setState("unavailable"); return; }
      setRanked(result);
      setState("done");
    } catch {
      setState("error");
    }
  }

  return (
    <Container className="py-12">
      <div className="mx-auto max-w-3xl">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#B23A25]">AI Photo Ranker</p>
        <h1 className="text-3xl font-bold tracking-tight text-[#1C1917] sm:text-4xl">Upload your photos — we&apos;ll pick your lead</h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-[#4a443d]">
          Your lead photo decides ~80% of your matches. Drop in the shots you&apos;re choosing between and an on-device AI ranks
          them — which to open with, which to keep, which to cut — scoring how well each one <em>communicates</em>, not how you look.
        </p>
        <p className="mt-2 text-xs text-[#857b6e]">🔒 Runs entirely in your browser. Your photos never leave your device.</p>

        <div className="my-8 rounded-2xl border border-[#1c1917]/[0.1] bg-[#fbf8f2]/60 p-6 text-center">
          <label className="inline-flex cursor-pointer flex-col items-center gap-3">
            <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => onFiles(e.target.files)} disabled={state === "reading" || state === "ranking"} />
            <span className="rounded-xl bg-[#1C1917] px-6 py-3 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5">
              {state === "reading" ? "Reading photos…" : state === "ranking" ? "Ranking (loading AI, one-time)…" : "Choose photos to rank"}
            </span>
            <span className="text-xs text-[#857b6e]">Up to 8 photos · JPG or PNG</span>
          </label>
          {state === "ranking" && (
            <p className="mt-4 text-xs text-[#857b6e]">First run downloads the AI model once (~a moment on Wi-Fi), then it&apos;s cached.</p>
          )}
        </div>

        {state === "unavailable" && (
          <div className="rounded-2xl border border-amber-500/25 bg-amber-500/[0.06] p-5 text-sm text-[#4a443d]">
            The on-device AI model couldn&apos;t load in this browser. You can still get a full photo read from the{" "}
            <Link href="/audit/new" className="font-semibold text-[#B23A25] underline">free Aura scan</Link>.
          </div>
        )}
        {state === "error" && (
          <div className="rounded-2xl border border-red-500/25 bg-red-500/[0.06] p-5 text-sm text-[#4a443d]">Couldn&apos;t read those files — try different images.</div>
        )}

        {state === "done" && ranked && (
          <div className="space-y-4">
            {ranked.map((p, i) => (
              <div key={p.index} className={`flex gap-4 rounded-2xl border p-4 ${p.role === "lead" ? "border-[#E14434]/40 bg-[#E14434]/[0.05]" : "border-[#1c1917]/[0.1] bg-[#fbf8f2]/50"}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.src} alt={`Ranked photo ${i + 1}`} className="h-28 w-24 shrink-0 rounded-xl object-cover" />
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <span className="font-mono text-lg font-bold text-[#1C1917]">#{i + 1}</span>
                    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${ROLE_STYLE[p.role].cls}`}>{ROLE_STYLE[p.role].label}</span>
                    <span className="ml-auto font-mono text-sm font-bold text-[#1C1917]">{p.score}<span className="text-[#857b6e]">/100</span></span>
                  </div>
                  <p className="text-xs text-[#4a443d]">{p.verdict}</p>
                  {p.strengths.length > 0 && (
                    <p className="mt-1.5 text-[11px] text-emerald-700">✓ {p.strengths.slice(0, 2).join(" · ")}</p>
                  )}
                  {p.fixes.length > 0 && (
                    <p className="mt-1 text-[11px] text-[#B23A25]">→ {p.fixes[0]}</p>
                  )}
                </div>
              </div>
            ))}
            <div className="rounded-2xl border border-[#1c1917]/[0.1] bg-[#1c1917]/[0.03] p-5 text-center">
              <p className="text-sm font-semibold text-[#1C1917]">Want the full read on your lead photo?</p>
              <p className="mx-auto mt-1 max-w-md text-xs text-[#6f675e]">The free Aura scan breaks down exactly why it scores where it does — lighting, expression, background — and the fixes.</p>
              <Link href="/audit/new" className="mt-3 inline-flex rounded-xl bg-[#1C1917] px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5">
                Scan my lead photo — free →
              </Link>
            </div>
          </div>
        )}
      </div>
    </Container>
  );
}
