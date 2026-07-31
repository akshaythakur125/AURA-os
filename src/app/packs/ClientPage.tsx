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
import type { AuditGoal } from "@/types/audit";

type M = Record<string, number | undefined>;
interface Check { label: string; ok: (m: M) => boolean; fix: string }

interface Pack {
  key: string; name: string; emoji: string; goal: AuditGoal; blurb: string; checks: Check[];
}

const lit: Check = { label: "Well lit", ok: (m) => (m.lightingScore ?? 0) >= 58, fix: "Face a window in daylight — soft light on your face." };
const sharp: Check = { label: "Sharp & clear", ok: (m) => (m.sharpness ?? 0) >= 52, fix: "Use the rear camera, clean the lens, hold steady." };
const cleanBg: Check = { label: "Clean background", ok: (m) => (m.backgroundComplexityEstimate ?? 100) <= 58, fix: "Move to a plain wall or clear the clutter behind you." };
const framing: Check = { label: "Good framing", ok: (m) => (m.compositionScore ?? 0) >= 52, fix: "Chest-up, eyes on the top third, a little headroom." };
const colourPops: Check = { label: "Colour pops", ok: (m) => (m.saturation ?? 0) >= 45, fix: "Wear one bold-colour piece and shoot in good light." };
const neutral: Check = { label: "Neutral, pro tones", ok: (m) => (m.saturation ?? 100) <= 60, fix: "Stick to solid neutral colours — navy, grey, white." };
const warm: Check = { label: "Warm & inviting", ok: (m) => (m.colorWarmth ?? 0) >= 45, fix: "Shoot in golden-hour or warm indoor light." };

const PACKS: Pack[] = [
  { key: "festival", name: "Festival Glow", emoji: "🪔", goal: "festival", blurb: "Diwali / party-ready — bold, photogenic, memorable.", checks: [lit, sharp, colourPops, framing] },
  { key: "placement", name: "Placement-Ready", emoji: "💼", goal: "linkedin", blurb: "Fresher headshot that says 'hire me'.", checks: [lit, sharp, cleanBg, framing, neutral] },
  { key: "dating", name: "Dating-Ready", emoji: "❤️", goal: "dating", blurb: "Warm, clear, swipe-worthy.", checks: [lit, sharp, cleanBg, warm] },
];

type Stage = "pick" | "upload" | "analyzing" | "result" | "error";

export default function PacksPage() {
  const [pack, setPack] = useState<Pack | null>(null);
  const [stage, setStage] = useState<Stage>("pick");
  const [score, setScore] = useState(0);
  const [auditId, setAuditId] = useState("");
  const [checks, setChecks] = useState<{ label: string; ok: boolean; fix: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const ref = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    if (!pack) return;
    setStage("analyzing"); setError(null);
    try {
      const { auditId, report } = await quickAnalyze(file, pack.goal);
      if (report.auraScore == null) { setError("Couldn't read that photo clearly. Try a well-lit shot where your face is visible."); setStage("error"); return; }
      const m = (report.imageMetrics as unknown as M) || {};
      setScore(report.auraScore);
      setAuditId(auditId);
      setChecks(pack.checks.map((c) => ({ label: c.label, ok: c.ok(m), fix: c.fix })));
      setStage("result");
      trackEvent({ eventName: "pack_result", auditId, metadata: { pack: pack.key, score: String(report.auraScore) } });
    } catch { setError("Something went wrong reading that image. Try an original JPEG or PNG."); setStage("error"); }
  }

  function reset() { setStage("pick"); setPack(null); setChecks([]); setError(null); if (ref.current) ref.current.value = ""; }
  const passed = checks.filter((c) => c.ok).length;

  return (
    <>
      <div className="aurora-mesh" />
      <Container className="relative py-10 sm:py-14">
        <GlowOrb color="rgba(225, 68, 52, 0.10)" size={320} className="top-[8%] right-[6%]" delay={0} />
        <div className="mx-auto max-w-lg">
          <FadeInView>
            <div className="mb-8 text-center">
              <h1 className="text-4xl font-bold tracking-tight text-[#1C1917] sm:text-5xl">Ready-For-It Packs <span className="text-[#E14434]">🎯</span></h1>
              <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-[#6F675E]">Got a moment coming up? Check if your photo is ready — with a checklist made for that exact occasion.</p>
            </div>
          </FadeInView>

          {stage === "pick" && (
            <FadeInView delay={100}>
              <div className="space-y-3">
                {PACKS.map((p) => (
                  <button key={p.key} onClick={() => { setPack(p); setStage("upload"); }} className="flex w-full items-center gap-4 rounded-2xl border border-[#1c1917]/[0.08] bg-[#1c1917]/[0.02] p-4 text-left transition-colors hover:border-[#E14434]/40 hover:bg-[#E14434]/[0.03]">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#E14434]/10 text-2xl">{p.emoji}</div>
                    <div>
                      <p className="font-semibold text-[#1C1917]">{p.name}</p>
                      <p className="text-xs text-[#857b6e]">{p.blurb}</p>
                    </div>
                    <span className="ml-auto text-[#B23A25]">→</span>
                  </button>
                ))}
              </div>
            </FadeInView>
          )}

          {stage === "upload" && pack && (
            <FadeInView delay={80}>
              <div className="mb-4 text-center"><span className="inline-flex items-center gap-2 rounded-full border border-[#E14434]/20 bg-[#E14434]/[0.06] px-3 py-1 text-sm font-medium text-[#B23A25]">{pack.emoji} {pack.name}</span></div>
              <div onClick={() => ref.current?.click()} className="cursor-pointer rounded-3xl border-2 border-dashed border-[#1c1917]/15 bg-[#1c1917]/[0.02] p-10 text-center transition-colors hover:border-[#E14434]/40">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#E14434]/10 text-3xl">📸</div>
                <p className="text-lg font-semibold text-[#1C1917]">Upload your photo</p>
                <p className="mt-1 text-sm text-[#857b6e]">Checked against the {pack.name} standard · on your device</p>
                <input ref={ref} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
              </div>
              <div className="mt-4 flex justify-center"><button onClick={reset} className="text-xs text-[#857b6e] hover:text-[#4a443d]">← Pick a different pack</button></div>
            </FadeInView>
          )}

          {stage === "analyzing" && (
            <FadeInView><Card className="py-14 text-center"><div className="mx-auto mb-5 h-12 w-12 animate-spin rounded-full border-4 border-[#E14434]/20 border-t-[#E14434]" /><p className="text-lg font-semibold text-[#1C1917]">Checking your photo…</p></Card></FadeInView>
          )}

          {stage === "error" && (
            <FadeInView><Card className="py-10 text-center"><div className="mb-3 text-4xl">🫥</div><p className="mb-2 text-lg font-semibold text-[#1C1917]">Couldn&apos;t check that one</p><p className="mx-auto mb-6 max-w-sm text-sm text-[#6f675e]">{error}</p><Button onClick={reset}>Try again</Button></Card></FadeInView>
          )}

          {stage === "result" && pack && (
            <div className="space-y-6">
              <FadeInView>
                <Card className="text-center">
                  <span className="inline-flex items-center gap-2 rounded-full border border-[#E14434]/20 bg-[#E14434]/[0.06] px-3 py-1 text-xs font-medium text-[#B23A25]">{pack.emoji} {pack.name}</span>
                  <div className="mt-4 flex items-end justify-center gap-1">
                    <span className="text-6xl font-bold text-[#1C1917]"><CountUp target={score} duration={1100} /></span>
                    <span className="mb-2 text-lg text-[#857b6e]">/ 100</span>
                  </div>
                  <p className="mt-2 text-sm font-medium text-[#4a443d]">{passed}/{checks.length} checks passed — {passed === checks.length ? "you're ready 🎉" : passed >= checks.length - 1 ? "almost there" : "a couple of quick fixes first"}</p>
                </Card>
              </FadeInView>

              <FadeInView delay={80}>
                <Card>
                  <h3 className="mb-3 text-sm font-semibold text-[#1C1917]">{pack.name} checklist</h3>
                  <div className="space-y-2.5">
                    {checks.map((c) => (
                      <div key={c.label} className="flex items-start gap-3">
                        <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs ${c.ok ? "bg-emerald-500/15 text-emerald-500" : "bg-red-500/15 text-red-500"}`}>{c.ok ? "✓" : "✕"}</span>
                        <div>
                          <p className={`text-sm ${c.ok ? "text-[#1C1917]" : "text-[#4a443d]"}`}>{c.label}</p>
                          {!c.ok && <p className="text-xs text-[#857b6e]">{c.fix}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </FadeInView>

              <FadeInView delay={160}>
                <div className="rounded-2xl border border-[#E14434]/20 bg-gradient-to-b from-[#E14434]/[0.06] to-transparent p-5 text-center">
                  <p className="text-sm font-semibold text-[#1C1917]">Get the full {pack.name} plan</p>
                  <p className="mx-auto mt-1 max-w-sm text-xs text-[#6f675e]">Every fix, your colours, and shoppable picks to nail the look.</p>
                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    <Link href={`/audit/${auditId}`}><Button size="sm" variant="secondary">See full report</Button></Link>
                    <Link href={`/unlock?auditId=${auditId}&product=aura_report`}><Button size="sm">Unlock — ₹21</Button></Link>
                  </div>
                </div>
              </FadeInView>
              <div className="flex justify-center pb-4"><button onClick={reset} className="text-sm text-[#857b6e] underline-offset-2 hover:text-[#4a443d] hover:underline">← Try another pack</button></div>
            </div>
          )}
        </div>
      </Container>
    </>
  );
}
