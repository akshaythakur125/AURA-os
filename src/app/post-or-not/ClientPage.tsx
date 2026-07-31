"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { GlowOrb } from "@/components/ui/GlowOrb";
import { FadeInView } from "@/components/ui/FadeInView";
import { CountUp } from "@/components/ui/CountUp";
import { compressImageToDataUrl } from "@/lib/image/processImage";
import { createAudit, updateAudit } from "@/lib/storage/auditStore";
import { generateFreeAuraReport } from "@/lib/aura-engine/generateAuraReport";
import { renderPostVerdictCard, type PostVerdict } from "@/lib/share/renderPostVerdictCard";
import { toneLine, TONE_META, type Tone } from "@/lib/aura-engine/toneLines";
import { trackEvent } from "@/lib/storage/analyticsStore";
import { ShopNudge } from "@/components/shop/ShopNudge";
import type { AuditType, AuditGoal, BudgetAmount } from "@/types/audit";

type Stage = "idle" | "analyzing" | "result" | "error";

interface Verdict {
  score: number;
  verdict: PostVerdict;
  oneLiner: string;
  leakTitle?: string;
  fix?: string;
  evidence?: string;
  auditId: string;
}

function verdictFromScore(score: number): PostVerdict {
  if (score >= 72) return "post";
  if (score >= 58) return "almost";
  return "notyet";
}

const META: Record<PostVerdict, { label: string; emoji: string; sub: string; ring: string; text: string; chip: string }> = {
  post: { label: "POST IT", emoji: "✅", sub: "This one's ready. Post it.", ring: "border-emerald-400/40", text: "text-emerald-500", chip: "bg-emerald-500/10 text-emerald-500 border-emerald-400/30" },
  almost: { label: "ALMOST", emoji: "🟡", sub: "So close — one fix and it's a yes.", ring: "border-amber-400/40", text: "text-amber-500", chip: "bg-amber-500/10 text-amber-600 border-amber-400/30" },
  notyet: { label: "NOT YET", emoji: "🔴", sub: "Hold up — one thing to fix first.", ring: "border-red-400/40", text: "text-red-500", chip: "bg-red-500/10 text-red-500 border-red-400/30" },
};

export default function PostOrNotPage() {
  const [stage, setStage] = useState<Stage>("idle");
  const [progress, setProgress] = useState("Reading your photo…");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Verdict | null>(null);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [includeImage, setIncludeImage] = useState(false);
  const [tone, setTone] = useState<Tone>("straight");
  const [cardUrl, setCardUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const blobRef = useRef<Blob | null>(null);

  const buildCard = useCallback(async (v: Verdict, imgUrl: string, withImage: boolean, line: string) => {
    try {
      const canvas = await renderPostVerdictCard({
        verdict: v.verdict,
        score: v.score,
        oneLiner: line,
        evidence: v.evidence,
        fix: v.fix,
        imageDataUrl: imgUrl,
        includeImage: withImage,
      });
      await new Promise<void>((resolve) => {
        canvas.toBlob((blob) => {
          if (blob) {
            blobRef.current = blob;
            setCardUrl((prev) => { if (prev) URL.revokeObjectURL(prev); return URL.createObjectURL(blob); });
          }
          resolve();
        }, "image/png");
      });
    } catch { /* card is a bonus — never block the verdict */ }
  }, []);

  async function handleFile(file: File) {
    setError(null);
    setStage("analyzing");
    setProgress("Reading your photo…");
    try {
      const compressed = await compressImageToDataUrl(file);
      setProgress("Finding your face & measuring the light…");
      const audit = createAudit({ auditType: "photo" as AuditType, goal: "confidence" as AuditGoal, budgetRange: 5000 as BudgetAmount });
      const withImg = updateAudit(audit.id, {
        imageDataUrl: compressed.dataUrl,
        imageMeta: { fileName: file.name, fileType: file.type, fileSize: file.size, width: compressed.width, height: compressed.height, compressedSize: compressed.dataUrl.length },
      });
      const report = await generateFreeAuraReport(withImg || { ...audit, imageDataUrl: compressed.dataUrl });
      setProgress("Scoring your aura…");

      if (report.auraScore == null) {
        setError(report.oneLineVerdict || "Couldn't read this photo clearly. Try a well-lit shot where your face is visible.");
        setStage("error");
        trackEvent({ eventName: "post_or_not_gated", auditId: audit.id });
        return;
      }

      const leak = (report.statusLeaks || [])[0];
      const v: Verdict = {
        score: report.auraScore,
        verdict: verdictFromScore(report.auraScore),
        oneLiner: report.oneLineVerdict,
        leakTitle: leak?.title,
        fix: leak?.fix,
        evidence: leak?.evidence,
        auditId: audit.id,
      };
      setImageDataUrl(compressed.dataUrl);
      setResult(v);
      setStage("result");
      setTone("straight");
      void buildCard(v, compressed.dataUrl, false, v.oneLiner);
      trackEvent({ eventName: "post_or_not_verdict", auditId: audit.id, metadata: { score: String(v.score), verdict: v.verdict } });
    } catch {
      setError("Something went wrong reading that image. Upload an original JPEG or PNG and try again.");
      setStage("error");
    }
  }

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  }
  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  }

  const currentLine = result ? toneLine(tone, result.verdict, result.oneLiner, result.score) : "";

  function toggleImage() {
    if (!result || !imageDataUrl) return;
    const next = !includeImage;
    setIncludeImage(next);
    void buildCard(result, imageDataUrl, next, currentLine);
  }
  function setToneAndRebuild(t: Tone) {
    if (!result || !imageDataUrl) return;
    setTone(t);
    void buildCard(result, imageDataUrl, includeImage, toneLine(t, result.verdict, result.oneLiner, result.score));
    trackEvent({ eventName: "post_or_not_tone", auditId: result.auditId, metadata: { tone: t } });
  }

  async function shareCard() {
    const blob = blobRef.current;
    if (!blob || !result) return;
    const file = new File([blob], "aura-post-or-not.png", { type: "image/png" });
    const nav = navigator as Navigator & { canShare?: (d: unknown) => boolean };
    if (nav.canShare && nav.canShare({ files: [file] })) {
      try {
        await navigator.share({ files: [file], text: `My photo just scored ${result.score}/100 on AuraCheck — ${META[result.verdict].label}. Get yours free at fixmyaura.shop` });
        trackEvent({ eventName: "post_or_not_shared", auditId: result.auditId });
        return;
      } catch { /* user cancelled — fall through to download */ }
    }
    downloadCard();
  }
  function downloadCard() {
    if (!cardUrl) return;
    const a = document.createElement("a");
    a.href = cardUrl;
    a.download = "aura-post-or-not.png";
    a.click();
    if (result) trackEvent({ eventName: "post_or_not_downloaded", auditId: result.auditId });
  }
  function copyText() {
    if (!result) return;
    navigator.clipboard.writeText(`My photo scored ${result.score}/100 on AuraCheck — ${META[result.verdict].label}. Get your free verdict at fixmyaura.shop`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function reset() {
    setStage("idle");
    setResult(null);
    setError(null);
    if (cardUrl) URL.revokeObjectURL(cardUrl);
    setCardUrl(null);
    setIncludeImage(false);
    blobRef.current = null;
    if (fileRef.current) fileRef.current.value = "";
  }

  const m = result ? META[result.verdict] : null;

  return (
    <>
      <div className="aurora-mesh" />
      <Container className="relative py-10 sm:py-14">
        <GlowOrb color="rgba(225, 68, 52, 0.10)" size={320} className="top-[8%] right-[6%]" delay={0} />
        <GlowOrb color="rgba(245, 158, 11, 0.07)" size={240} className="bottom-[12%] left-[6%]" delay={300} />

        <div className="mx-auto max-w-lg">
          {/* ─── Hero ─── */}
          {stage !== "result" && (
            <FadeInView>
              <div className="mb-8 text-center">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#E14434]/25 bg-[#E14434]/[0.07] px-3 py-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#E14434]" />
                  <span className="text-xs font-medium uppercase tracking-[0.14em] text-[#B23A25]">Instant · Free · Private</span>
                </div>
                <h1 className="text-4xl font-bold tracking-tight text-[#1C1917] sm:text-5xl">
                  Post or Not? <span className="text-[#E14434]">📸</span>
                </h1>
                <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-[#6F675E]">
                  Drop a pic and get an honest verdict in seconds — <span className="font-semibold text-[#4a443d]">POST IT, ALMOST,</span> or <span className="font-semibold text-[#4a443d]">NOT YET</span> — with the one measured reason and the fix. Then share your card.
                </p>
              </div>
            </FadeInView>
          )}

          {/* ─── Upload ─── */}
          {stage === "idle" && (
            <FadeInView delay={100}>
              <div
                onClick={() => fileRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
                className={`cursor-pointer rounded-3xl border-2 border-dashed p-10 text-center transition-colors ${dragOver ? "border-[#E14434]/60 bg-[#E14434]/[0.05]" : "border-[#1c1917]/15 bg-[#1c1917]/[0.02] hover:border-[#E14434]/40"}`}
              >
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#E14434]/10 text-3xl">📸</div>
                <p className="text-lg font-semibold text-[#1C1917]">Drop your photo or tap to upload</p>
                <p className="mt-1 text-sm text-[#857b6e]">JPEG, PNG or WebP · analyzed right here on your device</p>
                <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={onPick} />
              </div>
              <div className="mt-5 flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs text-[#8B8175]">
                <span>✓ Nothing uploaded to a server</span>
                <span>✓ Real measurements, not vibes</span>
                <span>✓ Free, no account</span>
              </div>
            </FadeInView>
          )}

          {/* ─── Analyzing ─── */}
          {stage === "analyzing" && (
            <FadeInView>
              <Card className="py-14 text-center">
                <div className="mx-auto mb-5 h-12 w-12 animate-spin rounded-full border-4 border-[#E14434]/20 border-t-[#E14434]" />
                <p className="text-lg font-semibold text-[#1C1917]">{progress}</p>
                <p className="mt-1 text-sm text-[#857b6e]">This takes a few seconds.</p>
              </Card>
            </FadeInView>
          )}

          {/* ─── Error / retake ─── */}
          {stage === "error" && (
            <FadeInView>
              <Card className="py-10 text-center">
                <div className="mx-auto mb-3 text-4xl">🫥</div>
                <p className="mb-2 text-lg font-semibold text-[#1C1917]">Couldn&apos;t call this one</p>
                <p className="mx-auto mb-6 max-w-sm text-sm text-[#6f675e]">{error}</p>
                <Button onClick={reset}>Try another photo</Button>
              </Card>
            </FadeInView>
          )}

          {/* ─── Result ─── */}
          {stage === "result" && result && m && (
            <div className="space-y-6">
              {/* Verdict */}
              <FadeInView>
                <Card className={`border-2 ${m.ring} text-center`}>
                  <div className="mb-1 text-5xl">{m.emoji}</div>
                  <div className={`text-4xl font-extrabold tracking-tight ${m.text}`}>{m.label}</div>
                  <p className="mt-1 text-sm text-[#6f675e]">{m.sub}</p>
                  <div className="mt-5 flex items-end justify-center gap-1">
                    <span className="text-6xl font-bold text-[#1C1917]"><CountUp target={result.score} duration={1200} /></span>
                    <span className="mb-2 text-lg text-[#857b6e]">/ 100</span>
                  </div>
                  <div className="mx-auto mt-3 h-2 max-w-xs overflow-hidden rounded-full bg-[#1c1917]/[0.06]">
                    <div className="h-full rounded-full bg-gradient-to-r from-[#E14434] to-[#f59e0b] transition-all duration-1000" style={{ width: `${result.score}%` }} />
                  </div>
                  <p className="mx-auto mt-4 max-w-sm text-sm text-[#4a443d]">{currentLine}</p>
                  <div className="mt-4 inline-flex items-center gap-1 rounded-full border border-[#1c1917]/10 bg-[#1c1917]/[0.03] p-1">
                    {(Object.keys(TONE_META) as Tone[]).map((tk) => (
                      <button
                        key={tk}
                        onClick={() => setToneAndRebuild(tk)}
                        className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${tone === tk ? "bg-[#1c1917] text-white" : "text-[#6f675e] hover:bg-[#1c1917]/[0.05]"}`}
                      >
                        {TONE_META[tk].emoji} {TONE_META[tk].label}
                      </button>
                    ))}
                  </div>
                </Card>
              </FadeInView>

              {/* The one reason */}
              {result.leakTitle && (
                <FadeInView delay={80}>
                  <Card>
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#B23A25]">The one thing holding it back</p>
                    <h3 className="mt-1 text-lg font-bold text-[#1C1917]">{result.leakTitle}</h3>
                    {result.evidence && (
                      <div className={`mt-2 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${m.chip}`}>
                        📊 Measured on your photo: {result.evidence}
                      </div>
                    )}
                    {result.fix && (
                      <div className="mt-3 rounded-xl border border-[#1c1917]/[0.08] bg-[#1c1917]/[0.03] p-3">
                        <div className="text-xs font-medium text-[#B23A25]">Do this</div>
                        <p className="mt-0.5 text-sm text-[#4a443d]">{result.fix}</p>
                      </div>
                    )}
                  </Card>
                </FadeInView>
              )}

              {/* Share card */}
              <FadeInView delay={140}>
                <Card>
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-[#1C1917]">Your shareable card</h3>
                    <label className="flex cursor-pointer items-center gap-2 text-xs text-[#6f675e]">
                      <input type="checkbox" checked={includeImage} onChange={toggleImage} className="h-3.5 w-3.5 rounded border-[#1c1917]/20 text-red-600 focus:ring-red-500/40" />
                      Include my photo
                    </label>
                  </div>
                  {cardUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={cardUrl} alt="Your Post or Not card" className="mx-auto w-full max-w-[260px] rounded-2xl border border-[#1c1917]/10 shadow-lg" />
                  ) : (
                    <div className="mx-auto flex h-[420px] w-full max-w-[260px] items-center justify-center rounded-2xl border border-[#1c1917]/10 bg-[#1c1917]/[0.03] text-sm text-[#857b6e]">Building your card…</div>
                  )}
                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    <Button size="sm" onClick={shareCard}>Share to Story</Button>
                    <Button size="sm" variant="secondary" onClick={downloadCard}>Download</Button>
                    <Button size="sm" variant="ghost" onClick={copyText}>{copied ? "Copied!" : "Copy caption"}</Button>
                  </div>
                </Card>
              </FadeInView>

              {/* Upsell + next */}
              <FadeInView delay={200}>
                <div className="rounded-2xl border border-[#E14434]/20 bg-gradient-to-b from-[#E14434]/[0.06] to-transparent p-5 text-center">
                  <p className="text-sm font-semibold text-[#1C1917]">Want the full breakdown?</p>
                  <p className="mx-auto mt-1 max-w-sm text-xs text-[#6f675e]">
                    Every fixable issue with the exact fix, a step-by-step roadmap, your colour palette, and shoppable picks — all under ₹100.
                  </p>
                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    <Link href={`/audit/${result.auditId}`}><Button size="sm" variant="secondary">See full free report</Button></Link>
                    <Link href={`/unlock?auditId=${result.auditId}&product=aura_report`}><Button size="sm">Unlock Full Report — ₹21</Button></Link>
                  </div>
                </div>
              </FadeInView>

              <FadeInView delay={240}><ShopNudge variant="gear" /></FadeInView>

              <div className="flex justify-center pb-4">
                <button onClick={reset} className="text-sm text-[#857b6e] underline-offset-2 hover:text-[#4a443d] hover:underline">← Try another photo</button>
              </div>
            </div>
          )}
        </div>
      </Container>
    </>
  );
}
