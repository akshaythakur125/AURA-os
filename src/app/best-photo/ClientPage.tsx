"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FadeInView } from "@/components/ui/FadeInView";
import { Scene3DAccent } from "@/components/hero/Scene3DAccent";
import { analyzeImageDataUrl } from "@/lib/aura-engine/imageMetrics";
import { hasAnyUnlock } from "@/lib/storage/unlockStore";

interface Scored {
  id: string;
  dataUrl: string;
  overall: number;
  dating: number;
  linkedin: number;
  instagram: number;
}

const PLATFORMS = [
  { key: "dating" as const, label: "Dating", emoji: "🌹" },
  { key: "linkedin" as const, label: "LinkedIn", emoji: "💼" },
  { key: "instagram" as const, label: "Instagram", emoji: "📸" },
];

function scorePhoto(m: Record<string, any>) {
  const bg = 100 - (m.backgroundComplexityEstimate ?? 50);
  const light = m.lightingScore ?? 50;
  const clarity = m.clarityScore ?? 50;
  const comp = m.compositionScore ?? 50;
  const color = m.colorHarmony ?? 50;
  const groom = m.groomingResult?.overallScore ?? 55;
  const sym = m.symmetryScore ?? 50;
  const r = (n: number) => Math.round(Math.max(0, Math.min(100, n)));
  const dating = 0.28 * clarity + 0.22 * light + 0.2 * groom + 0.15 * comp + 0.15 * sym;
  const linkedin = 0.3 * bg + 0.25 * light + 0.2 * comp + 0.15 * groom + 0.1 * clarity;
  const instagram = 0.3 * color + 0.25 * comp + 0.2 * light + 0.15 * clarity + 0.1 * bg;
  // Overall = the average of the platform fits, so the top pick is genuinely the
  // most versatile photo and the ranking stays consistent with the winners above.
  return {
    overall: r((dating + linkedin + instagram) / 3),
    dating: r(dating),
    linkedin: r(linkedin),
    instagram: r(instagram),
  };
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(fr.result as string);
    fr.onerror = reject;
    fr.readAsDataURL(file);
  });
}

export default function BestPhotoClient() {
  const [paid, setPaid] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const [results, setResults] = useState<Scored[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try { setPaid(hasAnyUnlock()); } catch { setPaid(false); }
  }, []);

  const onFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setBusy(true);
    const picked = Array.from(files).slice(0, 5);
    const scored: Scored[] = [];
    for (const f of picked) {
      try {
        const dataUrl = await readAsDataUrl(f);
        const metrics = await analyzeImageDataUrl(dataUrl);
        const s = scorePhoto(metrics as unknown as Record<string, any>);
        scored.push({ id: `${f.name}-${scored.length}`, dataUrl, ...s });
      } catch { /* skip unreadable */ }
    }
    scored.sort((a, b) => b.overall - a.overall);
    setResults(scored);
    setBusy(false);
  };

  const bestFor = (key: "dating" | "linkedin" | "instagram"): string | null => {
    if (results.length === 0) return null;
    return results.reduce((best, r) => (r[key] > best[key] ? r : best), results[0]).id;
  };

  return (
    <Container className="py-12">
      <div className="mb-8 text-center">
        <div className="mb-3 flex justify-center">
          <Scene3DAccent size={120} shape="model" />
        </div>
        <h1 className="text-2xl font-bold text-[#1C1917] sm:text-3xl">Best-Photo Picker</h1>
        <p className="mx-auto mt-2 max-w-lg text-sm text-[#6f675e]">
          Upload a few photos. We score each one and tell you which to use for dating, LinkedIn, and Instagram —
          because each platform rewards a different kind of shot.
        </p>
      </div>

      {paid === false ? (
        // Pro gate
        <Card className="mx-auto max-w-md text-center">
          <div className="mb-3 text-3xl">🔒</div>
          <h2 className="text-base font-semibold text-[#1C1917]">A Pro perk</h2>
          <p className="mx-auto mt-1 max-w-xs text-xs text-[#857b6e]">
            Comparing your photos and ranking them per platform is part of the full report. Unlock once, use it
            anytime.
          </p>
          <Link href="/pricing">
            <Button className="mt-4">Unlock Best-Photo Picker</Button>
          </Link>
        </Card>
      ) : (
        <>
          {/* Upload */}
          <Card className="mx-auto max-w-xl text-center">
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="hidden"
              onChange={(e) => onFiles(e.target.files)}
            />
            <button
              onClick={() => fileRef.current?.click()}
              disabled={busy}
              className="flex w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#1c1917]/12 bg-[#1c1917]/[0.02] p-8 transition-all hover:border-[#E14434]/30 disabled:opacity-50"
            >
              <span className="text-sm text-[#6f675e]">
                {busy ? "Scoring your photos…" : "Drop or browse — up to 5 photos"}
              </span>
              <span className="mt-1 text-xs text-[#9c9184]">Analyzed in your browser · nothing uploaded</span>
            </button>
          </Card>

          {/* Results */}
          {results.length > 0 && (
            <div className="mt-8">
              {/* Per-platform winners */}
              <div className="mb-6 grid gap-3 sm:grid-cols-3">
                {PLATFORMS.map((p) => {
                  const winnerId = bestFor(p.key);
                  const winner = results.find((r) => r.id === winnerId);
                  const idx = results.findIndex((r) => r.id === winnerId);
                  return (
                    <Card key={p.key} className="text-center">
                      <p className="text-xs font-medium text-[#857b6e]">{p.emoji} Best for {p.label}</p>
                      {winner && (
                        <>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={winner.dataUrl} alt="" className="mx-auto mt-2 h-24 w-24 rounded-xl object-cover" />
                          <p className="mt-2 text-lg font-bold text-[#1C1917]">Photo {idx + 1}</p>
                          <p className="text-xs text-[#E14434]">{winner[p.key]} / 100</p>
                        </>
                      )}
                    </Card>
                  );
                })}
              </div>

              {/* Full ranking */}
              <p className="mb-3 text-sm font-semibold text-[#1C1917]">Overall ranking</p>
              <div className="space-y-3">
                {results.map((r, i) => (
                  <FadeInView key={r.id} delay={i * 40}>
                    <Card className="flex items-center gap-4">
                      <div className="relative shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={r.dataUrl} alt="" className="h-20 w-20 rounded-xl object-cover" />
                        <span className="absolute -left-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#1c1917] text-xs font-bold text-white">
                          {i + 1}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex items-center gap-2">
                          <span className="text-lg font-bold text-[#1C1917]">{r.overall}</span>
                          <span className="text-xs text-[#9c9184]">overall</span>
                          {i === 0 && (
                            <span className="rounded-full bg-[#E14434]/12 px-2 py-0.5 text-[10px] font-semibold text-[#B23A25]">
                              Top pick
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-3 text-[11px] text-[#6f675e]">
                          {PLATFORMS.map((p) => (
                            <span key={p.key}>
                              {p.emoji} {p.label} <span className="font-medium text-[#1C1917]">{r[p.key]}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    </Card>
                  </FadeInView>
                ))}
              </div>
              <p className="mt-4 text-center text-[10px] text-[#9c9184]">
                Scores are guidance from local image analysis, not objective truth.
              </p>
            </div>
          )}
        </>
      )}
    </Container>
  );
}
