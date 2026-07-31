"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { GlowOrb } from "@/components/ui/GlowOrb";
import { FadeInView } from "@/components/ui/FadeInView";
import { CountUp } from "@/components/ui/CountUp";
import { quickAnalyze } from "@/lib/aura-engine/quickAnalyze";
import { trackEvent } from "@/lib/storage/analyticsStore";
import { ShopNudge } from "@/components/shop/ShopNudge";

type Stage = "idle" | "analyzing" | "result" | "error";

interface FitRes {
  auditId: string;
  score: number;
  styleName: string;
  reasoning: string;
  dominantHue: string;
  harmony: number;
  pops: boolean;
  upgrade: string;
  occasions: string[];
}

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

function occasionsFor(style: string): string[] {
  const s = (style || "").toLowerCase();
  if (/premium|professional|corporate|sharp/.test(s)) return ["Interviews", "Office", "LinkedIn"];
  if (/bold|creator|loud|statement/.test(s)) return ["Nights out", "Content", "Festivals"];
  if (/clean|understated|minimal|soft/.test(s)) return ["Dates", "Everyday", "Campus"];
  return ["Everyday", "Casual", "Socials"];
}

export default function FitCheckPage() {
  const [stage, setStage] = useState<Stage>("idle");
  const [res, setRes] = useState<FitRes | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setStage("analyzing"); setError(null);
    try {
      const { auditId, report } = await quickAnalyze(file, "confidence");
      const m = report.imageMetrics as unknown as Record<string, unknown> | undefined;
      if (!m || report.auraScore == null) {
        setError("Couldn't read that outfit clearly. Try a well-lit, full or half-body shot.");
        setStage("error"); return;
      }
      const cloth = (m.clothingRegion as { colorVariety?: number; contrastWithSkin?: number } | undefined) || {};
      const style = (m.detectedStyle as { detectedStyle?: string; reasoning?: string; upgradePath?: string } | undefined) || {};
      const harmony = clamp((m.colorHarmony as number) ?? 55);
      const contrast = clamp((cloth.contrastWithSkin as number) ?? 50);
      const styleConf = 55;
      const score = clamp(harmony * 0.4 + contrast * 0.3 + styleConf * 0.3);
      const styleName = style.detectedStyle || "Clean casual";
      setRes({
        auditId,
        score,
        styleName,
        reasoning: style.reasoning || "Your outfit reads put-together and intentional.",
        dominantHue: (m.dominantHue as string) || "neutral",
        harmony,
        pops: contrast >= 50,
        upgrade: style.upgradePath || "Add one considered accessory and keep the rest simple — quality over quantity.",
        occasions: occasionsFor(styleName),
      });
      setStage("result");
      trackEvent({ eventName: "fit_check_result", auditId, metadata: { score: String(score) } });
    } catch {
      setError("Something went wrong reading that image. Upload an original JPEG or PNG and try again.");
      setStage("error");
    }
  }

  function copyText() {
    if (!res) return;
    navigator.clipboard.writeText(`My fit scored ${res.score}/100 on AuraCheck — ${res.styleName}. Check yours free at fixmyaura.shop`);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  }
  function reset() { setStage("idle"); setRes(null); setError(null); if (ref.current) ref.current.value = ""; }

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
                <h1 className="text-4xl font-bold tracking-tight text-[#1C1917] sm:text-5xl">Fit Check <span className="text-[#E14434]">👗</span></h1>
                <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-[#6F675E]">Upload your outfit and get an honest read — your style, colours, what works, the one upgrade, and where the fit lands best.</p>
              </div>
            </FadeInView>
          )}

          {stage === "idle" && (
            <FadeInView delay={100}>
              <div onClick={() => ref.current?.click()} className="cursor-pointer rounded-3xl border-2 border-dashed border-[#1c1917]/15 bg-[#1c1917]/[0.02] p-10 text-center transition-colors hover:border-[#E14434]/40">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#E14434]/10 text-3xl">👗</div>
                <p className="text-lg font-semibold text-[#1C1917]">Drop your fit or tap to upload</p>
                <p className="mt-1 text-sm text-[#857b6e]">Full or half-body works best · analyzed on your device</p>
                <input ref={ref} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
              </div>
            </FadeInView>
          )}

          {stage === "analyzing" && (
            <FadeInView><Card className="py-14 text-center"><div className="mx-auto mb-5 h-12 w-12 animate-spin rounded-full border-4 border-[#E14434]/20 border-t-[#E14434]" /><p className="text-lg font-semibold text-[#1C1917]">Reading your fit…</p></Card></FadeInView>
          )}

          {stage === "error" && (
            <FadeInView><Card className="py-10 text-center"><div className="mb-3 text-4xl">🫥</div><p className="mb-2 text-lg font-semibold text-[#1C1917]">Couldn&apos;t read that fit</p><p className="mx-auto mb-6 max-w-sm text-sm text-[#6f675e]">{error}</p><Button onClick={reset}>Try another</Button></Card></FadeInView>
          )}

          {stage === "result" && res && (
            <div className="space-y-6">
              <FadeInView>
                <Card className="text-center">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#B23A25]">Your fit reads as</p>
                  <h2 className="mt-1 text-2xl font-bold capitalize text-[#1C1917]">{res.styleName}</h2>
                  <div className="mt-4 flex items-end justify-center gap-1">
                    <span className="text-6xl font-bold text-[#1C1917]"><CountUp target={res.score} duration={1200} /></span>
                    <span className="mb-2 text-lg text-[#857b6e]">/ 100</span>
                  </div>
                  <div className="mx-auto mt-3 h-2 max-w-xs overflow-hidden rounded-full bg-[#1c1917]/[0.06]"><div className="h-full rounded-full bg-gradient-to-r from-[#E14434] to-[#f59e0b]" style={{ width: `${res.score}%` }} /></div>
                  <p className="mx-auto mt-4 max-w-sm text-sm text-[#4a443d]">{res.reasoning}</p>
                </Card>
              </FadeInView>

              <FadeInView delay={80}>
                <Card>
                  <h3 className="mb-3 text-sm font-semibold text-[#1C1917]">The read</h3>
                  <div className="space-y-2.5 text-sm">
                    <div className="flex items-start gap-2"><span>🎨</span><span className="text-[#4a443d]">Dominant tone: <span className="font-medium capitalize text-[#1C1917]">{res.dominantHue}</span> · colour harmony <span className="font-medium">{res.harmony}/100</span></span></div>
                    <div className="flex items-start gap-2"><span>{res.pops ? "✨" : "🫥"}</span><span className="text-[#4a443d]">Your outfit {res.pops ? "pops nicely against" : "blends a little into"} your skin tone{res.pops ? "" : " — a touch more contrast would lift it"}.</span></div>
                    <div className="flex items-start gap-2"><span>📍</span><span className="text-[#4a443d]">Best for: {res.occasions.join(" · ")}</span></div>
                  </div>
                </Card>
              </FadeInView>

              <FadeInView delay={140}>
                <Card>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#B23A25]">The one upgrade</p>
                  <p className="mt-1 text-sm text-[#4a443d]">{res.upgrade}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Link href="/shop"><Button size="sm" variant="secondary">Shop the look</Button></Link>
                    <Button size="sm" variant="ghost" onClick={copyText}>{copied ? "Copied!" : "Copy caption"}</Button>
                  </div>
                </Card>
              </FadeInView>

              <FadeInView delay={200}>
                <div className="rounded-2xl border border-[#E14434]/20 bg-gradient-to-b from-[#E14434]/[0.06] to-transparent p-5 text-center">
                  <p className="text-sm font-semibold text-[#1C1917]">Want your full style breakdown?</p>
                  <p className="mx-auto mt-1 max-w-sm text-xs text-[#6f675e]">Your colour palette, a capsule wardrobe, and shoppable picks in your budget.</p>
                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    <Link href={`/audit/${res.auditId}`}><Button size="sm" variant="secondary">See full report</Button></Link>
                    <Link href={`/unlock?auditId=${res.auditId}&product=aura_report`}><Button size="sm">Unlock — ₹21</Button></Link>
                  </div>
                </div>
              </FadeInView>
              <FadeInView delay={240}><ShopNudge variant="style" /></FadeInView>
              <div className="flex justify-center pb-4"><button onClick={reset} className="text-sm text-[#857b6e] underline-offset-2 hover:text-[#4a443d] hover:underline">← Check another fit</button></div>
            </div>
          )}
        </div>
      </Container>
    </>
  );
}
