"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { GlowOrb } from "@/components/ui/GlowOrb";
import { FadeInView } from "@/components/ui/FadeInView";
import { quickAnalyze } from "@/lib/aura-engine/quickAnalyze";
import { renderWhichOneCard } from "@/lib/share/renderWhichOneCard";
import { trackEvent } from "@/lib/storage/analyticsStore";
import { ShopNudge } from "@/components/shop/ShopNudge";

type Stage = "idle" | "analyzing" | "result" | "error";

interface Slot { file: File; url: string; }

interface Res {
  scoreA: number; scoreB: number; winner: "A" | "B" | "tie";
  reason: string; auditWinner: string;
}

function Dropzone({ label, slot, onPick }: { label: string; slot: Slot | null; onPick: (f: File) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div
      onClick={() => ref.current?.click()}
      className="flex-1 cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed border-[#1c1917]/15 bg-[#1c1917]/[0.02] transition-colors hover:border-[#E14434]/40"
    >
      {slot ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={slot.url} alt={`Photo ${label}`} className="aspect-[3/4] w-full object-cover" />
      ) : (
        <div className="flex aspect-[3/4] w-full flex-col items-center justify-center p-4 text-center">
          <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-[#E14434]/10 text-2xl">{label}</div>
          <p className="text-sm font-medium text-[#4a443d]">Photo {label}</p>
          <p className="mt-0.5 text-xs text-[#857b6e]">Tap to upload</p>
        </div>
      )}
      <input ref={ref} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) onPick(f); }} />
    </div>
  );
}

export default function WhichOnePage() {
  const [stage, setStage] = useState<Stage>("idle");
  const [a, setA] = useState<Slot | null>(null);
  const [b, setB] = useState<Slot | null>(null);
  const [res, setRes] = useState<Res | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cardUrl, setCardUrl] = useState<string | null>(null);
  const [includeImages, setIncludeImages] = useState(false);
  const [copied, setCopied] = useState(false);
  const blobRef = useRef<Blob | null>(null);

  const pick = (which: "A" | "B") => (f: File) => {
    const url = URL.createObjectURL(f);
    if (which === "A") setA({ file: f, url }); else setB({ file: f, url });
  };

  const buildCard = useCallback(async (r: Res, imgA: string, imgB: string, withImg: boolean) => {
    try {
      const canvas = await renderWhichOneCard({ scoreA: r.scoreA, scoreB: r.scoreB, winner: r.winner, reason: r.reason, imageA: imgA, imageB: imgB, includeImages: withImg });
      await new Promise<void>((resolve) => canvas.toBlob((blob) => { if (blob) { blobRef.current = blob; setCardUrl((p) => { if (p) URL.revokeObjectURL(p); return URL.createObjectURL(blob); }); } resolve(); }, "image/png"));
    } catch { /* card is a bonus */ }
  }, []);

  async function compare() {
    if (!a || !b) return;
    setStage("analyzing"); setError(null);
    try {
      const [ra, rb] = await Promise.all([quickAnalyze(a.file), quickAnalyze(b.file)]);
      const sa = ra.report.auraScore, sb = rb.report.auraScore;
      if (sa == null || sb == null) {
        setError("One of those photos couldn't be read clearly. Try well-lit shots where the face is visible.");
        setStage("error"); return;
      }
      const winner: "A" | "B" | "tie" = Math.abs(sa - sb) <= 2 ? "tie" : sa > sb ? "A" : "B";
      const loser = winner === "A" ? rb : ra;
      const gap = Math.abs(sa - sb);
      const loserLeak = (loser.report.statusLeaks || [])[0]?.title?.toLowerCase().replace(/^your /, "");
      const reason =
        winner === "tie"
          ? "Basically identical — post whichever feels more you."
          : gap <= 6
            ? `Close call, but Photo ${winner} edges it — cleaner read overall.` + (loserLeak ? ` The other's weak spot: ${loserLeak}.` : "")
            : `Photo ${winner} wins clearly.` + (loserLeak ? ` The other's biggest miss: ${loserLeak}.` : "");
      const r: Res = { scoreA: sa, scoreB: sb, winner, reason, auditWinner: winner === "B" ? rb.auditId : ra.auditId };
      setRes(r); setStage("result");
      void buildCard(r, a.url, b.url, false);
      trackEvent({ eventName: "which_one_result", metadata: { winner, gap: String(gap) } });
    } catch {
      setError("Something went wrong reading those images. Upload original JPEGs or PNGs and try again.");
      setStage("error");
    }
  }

  function toggleImages() {
    if (!res || !a || !b) return;
    const next = !includeImages; setIncludeImages(next);
    void buildCard(res, a.url, b.url, next);
  }
  async function shareCard() {
    const blob = blobRef.current; if (!blob || !res) return;
    const file = new File([blob], "aura-which-one.png", { type: "image/png" });
    const nav = navigator as Navigator & { canShare?: (d: unknown) => boolean };
    if (nav.canShare && nav.canShare({ files: [file] })) {
      try { await navigator.share({ files: [file], text: `AuraCheck settled it — Photo ${res.winner} wins. Which one would you post? fixmyaura.shop` }); trackEvent({ eventName: "which_one_shared" }); return; } catch {}
    }
    if (cardUrl) { const el = document.createElement("a"); el.href = cardUrl; el.download = "aura-which-one.png"; el.click(); }
  }
  function copyText() {
    if (!res) return;
    navigator.clipboard.writeText(`AuraCheck settled it — Photo ${res.winner} wins (${res.scoreA} vs ${res.scoreB}). Get your verdict free at fixmyaura.shop`);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  }
  function reset() { setStage("idle"); setRes(null); setError(null); setA(null); setB(null); if (cardUrl) URL.revokeObjectURL(cardUrl); setCardUrl(null); setIncludeImages(false); blobRef.current = null; }

  return (
    <>
      <div className="aurora-mesh" />
      <Container className="relative py-10 sm:py-14">
        <GlowOrb color="rgba(225, 68, 52, 0.10)" size={320} className="top-[8%] right-[6%]" delay={0} />
        <div className="mx-auto max-w-lg">
          {stage !== "result" && (
            <FadeInView>
              <div className="mb-8 text-center">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#E14434]/25 bg-[#E14434]/[0.07] px-3 py-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#E14434]" />
                  <span className="text-xs font-medium uppercase tracking-[0.14em] text-[#B23A25]">Free · Instant · Private</span>
                </div>
                <h1 className="text-4xl font-bold tracking-tight text-[#1C1917] sm:text-5xl">Which One? <span className="text-[#E14434]">🤔</span></h1>
                <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-[#6F675E]">Stuck between two pics? Upload both and we&apos;ll tell you which one to post — and exactly why.</p>
              </div>
            </FadeInView>
          )}

          {(stage === "idle" || stage === "analyzing") && (
            <FadeInView delay={100}>
              <div className="flex gap-3">
                <Dropzone label="A" slot={a} onPick={pick("A")} />
                <Dropzone label="B" slot={b} onPick={pick("B")} />
              </div>
              <div className="mt-6 flex justify-center">
                <Button size="lg" onClick={compare} disabled={!a || !b || stage === "analyzing"} className="px-10">
                  {stage === "analyzing" ? "Comparing…" : "Compare"}
                </Button>
              </div>
              <p className="mt-4 text-center text-xs text-[#8B8175]">Both analyzed right here on your device · nothing uploaded</p>
            </FadeInView>
          )}

          {stage === "error" && (
            <FadeInView>
              <Card className="py-10 text-center">
                <div className="mb-3 text-4xl">🫥</div>
                <p className="mb-2 text-lg font-semibold text-[#1C1917]">Couldn&apos;t compare those</p>
                <p className="mx-auto mb-6 max-w-sm text-sm text-[#6f675e]">{error}</p>
                <Button onClick={reset}>Try again</Button>
              </Card>
            </FadeInView>
          )}

          {stage === "result" && res && a && b && (
            <div className="space-y-6">
              <FadeInView>
                <Card>
                  <div className="grid grid-cols-2 gap-3">
                    {(["A", "B"] as const).map((k) => {
                      const win = res.winner === k;
                      const slot = k === "A" ? a : b;
                      const score = k === "A" ? res.scoreA : res.scoreB;
                      return (
                        <div key={k} className={`overflow-hidden rounded-2xl border-2 ${win ? "border-emerald-400/50" : "border-[#1c1917]/[0.08]"}`}>
                          <div className="relative">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={slot.url} alt={`Photo ${k}`} className="aspect-[3/4] w-full object-cover" />
                            {win && <div className="absolute right-2 top-2 rounded-full bg-emerald-500 px-2 py-0.5 text-xs font-bold text-white">👑 Winner</div>}
                          </div>
                          <div className="p-3 text-center">
                            <div className={`text-3xl font-bold ${win ? "text-emerald-500" : "text-[#1C1917]"}`}>{score}</div>
                            <div className="text-[11px] text-[#857b6e]">Photo {k} · /100</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <p className="mt-4 text-center text-lg font-bold text-[#1C1917]">{res.winner === "tie" ? "It's a tie" : `Post Photo ${res.winner}`}</p>
                  <p className="mx-auto mt-1 max-w-sm text-center text-sm text-[#4a443d]">{res.reason}</p>
                </Card>
              </FadeInView>

              <FadeInView delay={120}>
                <Card>
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-[#1C1917]">Your shareable card</h3>
                    <label className="flex cursor-pointer items-center gap-2 text-xs text-[#6f675e]">
                      <input type="checkbox" checked={includeImages} onChange={toggleImages} className="h-3.5 w-3.5 rounded border-[#1c1917]/20 text-red-600 focus:ring-red-500/40" />
                      Include my photos
                    </label>
                  </div>
                  {cardUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={cardUrl} alt="Which One card" className="mx-auto w-full max-w-[260px] rounded-2xl border border-[#1c1917]/10 shadow-lg" />
                  ) : (
                    <div className="mx-auto flex h-[420px] w-full max-w-[260px] items-center justify-center rounded-2xl border border-[#1c1917]/10 bg-[#1c1917]/[0.03] text-sm text-[#857b6e]">Building your card…</div>
                  )}
                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    <Button size="sm" onClick={shareCard}>Share to Story</Button>
                    <Button size="sm" variant="ghost" onClick={copyText}>{copied ? "Copied!" : "Copy caption"}</Button>
                  </div>
                </Card>
              </FadeInView>

              <FadeInView delay={200}>
                <div className="rounded-2xl border border-[#E14434]/20 bg-gradient-to-b from-[#E14434]/[0.06] to-transparent p-5 text-center">
                  <p className="text-sm font-semibold text-[#1C1917]">Want the winner&apos;s full breakdown?</p>
                  <p className="mx-auto mt-1 max-w-sm text-xs text-[#6f675e]">Every fix, your colours, and shoppable picks to make your best photo even better.</p>
                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    <Link href={`/audit/${res.auditWinner}`}><Button size="sm" variant="secondary">See full report</Button></Link>
                    <Link href={`/unlock?auditId=${res.auditWinner}&product=aura_report`}><Button size="sm">Unlock — ₹25</Button></Link>
                  </div>
                </div>
              </FadeInView>
              <FadeInView delay={240}><ShopNudge variant="gear" /></FadeInView>
              <div className="flex justify-center pb-4"><button onClick={reset} className="text-sm text-[#857b6e] underline-offset-2 hover:text-[#4a443d] hover:underline">← Compare two more</button></div>
            </div>
          )}
        </div>
      </Container>
    </>
  );
}
