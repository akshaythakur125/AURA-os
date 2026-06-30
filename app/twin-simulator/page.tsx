"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { TwinVariantCard } from "@/components/aura-twin/TwinVariantCard";
import { TwinComparisonGrid } from "@/components/aura-twin/TwinComparisonGrid";
import { BeforeAfterSlider } from "@/components/aura-twin/BeforeAfterSlider";
import { createTwinVariants } from "@/lib/aura-twin/createTwinVariants";
import { rankTwinVariants, getBestVariant } from "@/lib/aura-twin/rankTwinVariants";
import { buildTwinStrategy } from "@/lib/aura-twin/buildTwinStrategy";
import type { TwinStrategyOutput } from "@/lib/aura-twin/buildTwinStrategy";
import { downloadComparisonPng } from "@/lib/aura-twin/downloadComparisonPng";
import { createTwinResult, getLatestTwinResult } from "@/lib/storage/auraTwinStore";
import { getAudits, createAudit } from "@/lib/storage/auditStore";
import { validateImage, processImage } from "@/lib/image/processImage";
import { trackEvent } from "@/lib/storage/analyticsStore";
import type { TwinGoal, AuraTwinVariant } from "@/types/auraTwin";
import { TWIN_GOAL_LABELS } from "@/types/auraTwin";
import type { BudgetRange } from "@/types";

function mapTwinGoalToAuditGoal(goal: TwinGoal): NonNullable<import("@/types").Goal> {
  const map: Record<TwinGoal, NonNullable<import("@/types").Goal>> = {
    dating_profile: "dating",
    instagram: "instagram",
    professional: "office",
    college_social: "college",
    creator: "instagram",
    general: "glowup",
  };
  return map[goal];
}

function mapTwinGoalToAuditType(goal: TwinGoal): NonNullable<import("@/types").AuditType> {
  if (goal === "dating_profile") return "dating";
  return "photo";
}

const GOALS: { id: TwinGoal; label: string; emoji: string }[] = [
  { id: "dating_profile", label: "Dating Profile", emoji: "💜" },
  { id: "instagram", label: "Instagram", emoji: "📱" },
  { id: "professional", label: "Professional", emoji: "💼" },
  { id: "college_social", label: "College / Social", emoji: "🎓" },
  { id: "creator", label: "Creator", emoji: "🎬" },
  { id: "general", label: "General", emoji: "📊" },
];

export default function TwinSimulatorPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [imageMeta, setImageMeta] = useState<{
    fileName: string; fileType: string; fileSize: number;
    compressedSize: number; width: number; height: number;
  } | null>(null);
  const [goal, setGoal] = useState<TwinGoal>("general");
  const [processing, setProcessing] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number; label: string } | null>(null);
  const [result, setResult] = useState<{
    variants: AuraTwinVariant[];
    rankedIds: string[];
    bestVariantId: string;
    originalScore: number;
    bestScore: number;
    bestDelta: number;
    strategy: TwinStrategyOutput;
  } | null>(null);
  const [savedResultId, setSavedResultId] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState<string | null>(null);
  const [downloadStatus, setDownloadStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    trackEvent("aura_twin_page_viewed");
  }, []);

  const audits = typeof window !== "undefined" ? getAudits() : [];
  const latestAudit = audits.length > 0 ? audits[0] : null;

  function resetResult() {
    setResult(null);
    setSavedResultId(null);
    setProgress(null);
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    const validationError = validateImage(file);
    if (validationError) {
      setError(validationError);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    setProcessing(true);
    processImage(file)
      .then((res) => {
        setImageDataUrl(res.dataUrl);
        setImageMeta(res.meta);
        setProcessing(false);
        resetResult();
        trackEvent("aura_twin_uploaded");
      })
      .catch((err) => {
        setError(err.message || "Image processing failed");
        setProcessing(false);
      });
  }

  function handleUseLatestAudit() {
    if (!latestAudit?.imageDataUrl) return;
    setError(null);
    setImageDataUrl(latestAudit.imageDataUrl);
    setImageMeta(latestAudit.imageMeta);
    resetResult();
  }

  function handleRemoveImage() {
    setImageDataUrl(null);
    setImageMeta(null);
    resetResult();
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleAnalyze() {
    if (!imageDataUrl) return;
    setError(null);
    setAnalyzing(true);
    setProgress({ done: 0, total: 10, label: "Starting..." });

    try {
      const variants = await createTwinVariants(imageDataUrl, (done, total, label) => {
        setProgress({ done, total, label });
      });

      const rankedIds = rankTwinVariants({ variants, goal });
      const original = variants.find((v) => v.type === "original")!;
      const strategy = buildTwinStrategy({ variants, originalScore: original.score, goal });

      setResult({
        variants,
        rankedIds,
        bestVariantId: strategy.bestVariantId,
        originalScore: original.score,
        bestScore: variants.find((v) => v.id === strategy.bestVariantId)!.score,
        bestDelta: variants.find((v) => v.id === strategy.bestVariantId)!.scoreDelta,
        strategy,
      });

      setProgress(null);
      trackEvent("aura_twin_generated");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
      setProgress(null);
    } finally {
      setAnalyzing(false);
    }
  }

  function handleSaveResult() {
    if (!result || !imageDataUrl) return;
    const s = result.strategy;
    const saved = createTwinResult({
      sourceAuditId: latestAudit?.id,
      originalImageDataUrl: imageDataUrl,
      originalScore: result.originalScore,
      bestVariantId: s.bestVariantId,
      variants: result.variants,
      rankedVariantIds: result.rankedIds,
      freeUpgradeWinner: s.freeUpgradeWinner,
      paidUpgradeWinner: s.paidUpgradeWinner,
      statusRoiSummary: s.statusRoiSummary,
      avoidForNow: s.avoidForNow,
      finalStrategy: s.finalStrategy,
      actionTiers: s.actionTiers,
      goal,
    });
    setSavedResultId(saved.id);
    trackEvent("aura_twin_saved");
  }

  function handleCopyStrategy() {
    if (!result) return;
    const s = result.strategy;
    let text = "Aura Twin Strategy\n";
    text += "===================\n\n";
    text += `Original Score: ${result.originalScore}\n`;
    text += `Best Predicted: ${result.bestScore} (+${result.bestDelta})\n\n`;
    text += `${s.finalStrategy}\n\n`;
    text += s.statusRoiSummary + "\n\n";
    text += "What to avoid:\n" + s.avoidForNow + "\n\n";
    text += "Action Plan:\n";
    for (const tier of s.actionTiers) {
      text += `  Tier ${tier.tier} — ${tier.label}\n`;
      for (const a of tier.actions) text += `    • ${a}\n`;
    }

    navigator.clipboard.writeText(text).then(() => {
      setCopyStatus("Copied!");
      trackEvent("aura_twin_strategy_copied");
      setTimeout(() => setCopyStatus(null), 2000);
    }).catch(() => {
      setCopyStatus("Copy failed");
      setTimeout(() => setCopyStatus(null), 2000);
    });
  }

  function handleDownloadPng() {
    if (!result) return;
    const best = getBestVariant(result.variants, goal);
    setDownloadStatus("Generating...");
    downloadComparisonPng(
      result.variants.find((v) => v.type === "original")!.imageDataUrl,
      best.imageDataUrl,
      result.originalScore,
      best.score,
      best.title
    )
      .then(() => {
        setDownloadStatus("Downloaded!");
        setTimeout(() => setDownloadStatus(null), 2000);
      })
      .catch(() => {
        setDownloadStatus("Failed");
        setTimeout(() => setDownloadStatus(null), 2000);
      });
  }

  function handleCreateAuditFromBest() {
    if (!result) return;
    const best = getBestVariant(result.variants, goal);

    const audit = createAudit({
      auditType: mapTwinGoalToAuditType(goal),
      goal: mapTwinGoalToAuditGoal(goal),
      budgetRange: "0" as BudgetRange,
      imageDataUrl: best.imageDataUrl,
      imageMeta: imageMeta || {
        fileName: "twin-variant.jpg",
        fileType: "image/jpeg",
        fileSize: 0,
        compressedSize: 0,
        width: best.metrics.width,
        height: best.metrics.height,
      },
    });

    trackEvent("aura_twin_audit_created");
    router.push(`/audit/${audit.id}`);
  }

  const bestVariant = result ? getBestVariant(result.variants, goal) : null;
  const originalVariant = result?.variants.find((v) => v.type === "original");

  return (
    <Container className="py-8 sm:py-12">
      <div className="mx-auto max-w-4xl">
        {/* ─── Hero ─── */}
        <div className="mb-8 text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/10 px-4 py-1.5 text-xs text-purple-300">
            🔮 Local-Only • No AI Upload • Your Image Stays Here
          </div>
          <h1 className="mb-3 text-4xl font-bold text-white">Aura Twin Simulator</h1>
          <p className="mx-auto max-w-xl text-sm leading-relaxed text-gray-400">
            See which visual upgrade could improve your Aura Score before spending a single rupee. We generate 10 local what-if versions and predict the winner.
          </p>
        </div>

        {/* ─── Safety Note ─── */}
        <div className="mb-8 rounded-xl border border-purple-500/10 bg-purple-500/5 px-4 py-3 text-xs leading-relaxed text-gray-500">
          <p className="mb-1 font-medium text-purple-300/80">Important</p>
          <p>
            These previews are local canvas simulations to show likely direction, not final professional retouching. Aura Twin ranks presentation quality, not human worth. This does not infer caste, religion, ethnicity, sexuality, health, exact income, or protected traits. No external AI service is used. Your image stays in this browser. Predicted score changes are guidance, not objective truth.
          </p>
        </div>

        {/* ─── Section 1: Upload / Select ─── */}
        <Card className="mb-6">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-500/20 text-sm">1</span>
            Choose your photo
          </h2>

          <input
            ref={fileInputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.webp"
            onChange={handleFileSelect}
            className="hidden"
          />

          {imageDataUrl ? (
            <div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageDataUrl}
                alt="Selected"
                className="mb-4 max-h-64 w-full rounded-xl object-contain bg-white/[0.02]"
              />
              <div className="flex flex-wrap gap-2">
                <Button variant="ghost" size="sm" onClick={() => fileInputRef.current?.click()}>
                  Replace Image
                </Button>
                <Button variant="ghost" size="sm" onClick={handleRemoveImage}>
                  Remove
                </Button>
                {latestAudit && (
                  <Button variant="ghost" size="sm" onClick={handleUseLatestAudit}>
                    Use Latest Audit
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={processing}
                className="flex cursor-pointer flex-col items-center rounded-2xl border-2 border-dashed border-white/10 bg-white/[0.02] px-6 py-10 transition-all hover:border-purple-500/30 hover:bg-purple-500/[0.02] disabled:opacity-50"
              >
                {processing ? (
                  <p className="text-sm text-gray-400">Processing...</p>
                ) : (
                  <>
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-pink-500">
                      <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="mb-1 text-sm font-medium text-gray-300">Upload a photo</p>
                    <p className="text-xs text-gray-600">JPG, PNG, or WebP</p>
                  </>
                )}
              </button>

              {latestAudit ? (
                <button
                  onClick={handleUseLatestAudit}
                  className="flex cursor-pointer flex-col items-center rounded-2xl border-2 border-dashed border-purple-500/20 bg-purple-500/[0.02] px-6 py-10 transition-all hover:border-purple-500/40 hover:bg-purple-500/[0.05]"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={latestAudit.imageDataUrl}
                    alt="Latest audit"
                    className="mb-3 h-20 w-20 rounded-xl object-cover"
                  />
                  <p className="mb-1 text-sm font-medium text-gray-300">Use latest audit photo</p>
                  {latestAudit.freeScore !== undefined && (
                    <p className="text-xs text-purple-400">Current score: {latestAudit.freeScore}</p>
                  )}
                  <p className="mt-1 text-[10px] text-gray-600">
                    {latestAudit.imageMeta?.fileName || "Audit image"}
                  </p>
                </button>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/5 bg-white/[0.01] px-6 py-10">
                  <p className="text-sm text-gray-600">No previous audits</p>
                  <p className="text-xs text-gray-700">Upload a photo above to get started</p>
                </div>
              )}
            </div>
          )}
        </Card>

        {/* ─── Section 2: Goal ─── */}
        <Card className="mb-6">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-500/20 text-sm">2</span>
            What&apos;s your goal?
          </h2>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
            {GOALS.map((g) => {
              const selected = goal === g.id;
              return (
                <button
                  key={g.id}
                  onClick={() => setGoal(g.id)}
                  className={`flex flex-col items-center rounded-xl border px-3 py-3 text-center transition-all ${
                    selected
                      ? "border-purple-500/50 bg-purple-500/10 ring-1 ring-purple-500/30"
                      : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.05]"
                  }`}
                >
                  <span className="mb-1 text-lg">{g.emoji}</span>
                  <span className={`text-xs ${selected ? "text-purple-300" : "text-gray-400"}`}>
                    {TWIN_GOAL_LABELS[g.id] || g.label}
                  </span>
                </button>
              );
            })}
          </div>
        </Card>

        {/* ─── Analyze Button ─── */}
        <div className="mb-8 text-center">
          <Button
            size="lg"
            onClick={handleAnalyze}
            disabled={!imageDataUrl || analyzing}
            className="px-12"
          >
            {analyzing ? (
              <span className="flex items-center gap-2">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                {progress ? `${progress.label} (${progress.done}/${progress.total})` : "Generating variants..."}
              </span>
            ) : (
              "Analyze & Simulate Variants"
            )}
          </Button>
          {progress && (
            <div className="mx-auto mt-3 h-1.5 w-64 overflow-hidden rounded-full bg-white/5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-purple-600 to-pink-500 transition-all duration-300"
                style={{ width: `${(progress.done / progress.total) * 100}%` }}
              />
            </div>
          )}
        </div>

        {/* ─── Error ─── */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* ─── Results ─── */}
        {result && (
          <div className="space-y-8">
            {/* ─── Score cards ─── */}
            <div className="grid gap-4 sm:grid-cols-4">
              <Card>
                <div className="text-xs text-gray-500">Current Score</div>
                <div className="mt-1 text-3xl font-bold text-white">{result.originalScore}</div>
              </Card>
              <Card className="border-emerald-500/20">
                <div className="text-xs text-gray-500">Best Predicted</div>
                <div className="mt-1 text-3xl font-bold text-emerald-400">{result.bestScore}</div>
              </Card>
              <Card className="border-purple-500/20">
                <div className="text-xs text-gray-500">Max Gain</div>
                <div className="mt-1 text-3xl font-bold text-purple-400">+{result.bestDelta}</div>
              </Card>
              <Card className="border-amber-500/20">
                <div className="text-xs text-gray-500">Variants Tested</div>
                <div className="mt-1 text-3xl font-bold text-amber-400">{result.variants.length}</div>
              </Card>
            </div>

            {/* ─── Before / After Slider ─── */}
            {bestVariant && originalVariant && (
              <div>
                <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
                  🖼️ Original vs {bestVariant.title}
                </h2>
                <BeforeAfterSlider
                  beforeImage={originalVariant.imageDataUrl}
                  afterImage={bestVariant.imageDataUrl}
                  beforeLabel={`Original (${result.originalScore})`}
                  afterLabel={`${bestVariant.title} (${bestVariant.score})`}
                  className="max-h-96 w-full"
                />
              </div>
            )}

            {/* ─── Best Variant + Strategy ─── */}
            <div>
              <h2 className="mb-4 text-lg font-semibold text-white">🏆 Best Predicted Improvement</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  {bestVariant && <TwinVariantCard variant={bestVariant} isBest />}
                </div>
                <div className="space-y-3">
                  <div className="rounded-xl bg-emerald-500/10 p-4">
                    <p className="text-sm font-semibold text-emerald-300">+{result.bestDelta} points predicted</p>
                    <p className="mt-1 text-xs leading-relaxed text-emerald-400/70">
                      {bestVariant?.title} is the winner. {(bestVariant?.scoreDelta ?? 0) > 5
                        ? "This is a significant improvement you should act on."
                        : "A solid gain from a simple change."
                      }
                    </p>
                  </div>
                  <div className="rounded-xl bg-purple-500/10 p-4 text-xs leading-relaxed text-purple-300">
                    {result.strategy.finalStrategy}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" onClick={handleSaveResult}>
                      {savedResultId ? "Saved ✓" : "Save Result"}
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleCopyStrategy}>
                      {copyStatus || "Copy Strategy"}
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleDownloadPng}>
                      {downloadStatus || "Download PNG"}
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleCreateAuditFromBest}>
                      Create Audit
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* ─── Action Tiers ─── */}
            <div>
              <h2 className="mb-4 text-lg font-semibold text-white">📋 Action Plan</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {result.strategy.actionTiers.map((tier) => (
                  <Card key={tier.tier} className="border-purple-500/10">
                    <div className="mb-3 flex items-center gap-2">
                      <Badge variant={tier.tier === 1 ? "success" : tier.tier === 2 ? "warning" : "default"}>
                        Tier {tier.tier}
                      </Badge>
                      <span className="text-sm font-medium text-white">{tier.label}</span>
                    </div>
                    <ul className="space-y-2">
                      {tier.actions.map((a, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-gray-400">
                          <span className="mt-0.5 text-purple-400">→</span>
                          <span>{a}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>
                ))}
              </div>
            </div>

            {/* ─── Status ROI Summary ─── */}
            <Card className="border-amber-500/20">
              <h2 className="mb-3 text-lg font-semibold text-white">💰 Status ROI Summary</h2>
              <p className="text-sm leading-relaxed text-gray-300">{result.strategy.statusRoiSummary}</p>
            </Card>

            {/* ─── What Not to Spend On ─── */}
            <Card className="border-red-500/15">
              <h2 className="mb-3 text-lg font-semibold text-white">🚫 What Not to Spend On Yet</h2>
              <p className="text-sm leading-relaxed text-gray-400">{result.strategy.avoidForNow}</p>
            </Card>

            {/* ─── All Variants ─── */}
            <div>
              <h2 className="mb-4 text-lg font-semibold text-white">🔬 All Variants Compared</h2>
              <TwinComparisonGrid
                variants={result.variants}
                bestVariantId={result.strategy.bestVariantId}
                rankedIds={result.rankedIds}
              />
              <p className="mt-4 text-center text-xs text-gray-600">
                These previews are local canvas simulations to show likely direction, not final professional retouching. Your image never leaves this browser.
              </p>
            </div>

            {/* ─── Print ─── */}
            <div className="flex flex-wrap justify-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => window.print()}>
                🖨️ Print Report
              </Button>
            </div>
          </div>
        )}

        {/* ─── Latest Saved Result Preview ─── */}
        {!result && !analyzing && (() => {
          const latestTwin = typeof window !== "undefined" ? getLatestTwinResult() : undefined;
          if (!latestTwin) return null;
          const best = latestTwin.variants.find((v) => v.id === latestTwin.bestVariantId);
          return (
            <Card className="border-purple-500/20">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="mb-1 text-lg font-semibold text-white">📂 Your Last Aura Twin</h2>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-gray-500">Original: <strong className="text-white">{latestTwin.originalScore}</strong></span>
                    <span className="text-gray-500">Best: <strong className="text-emerald-400">{best?.score ?? "—"}</strong></span>
                    <span className="text-gray-500">Fix: <strong className="text-purple-300">{best?.title ?? "—"}</strong></span>
                  </div>
                </div>
                {best && (
                  <div className="hidden h-14 w-14 overflow-hidden rounded-lg bg-white/5 sm:block">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={best.imageDataUrl} alt="" className="h-full w-full object-cover" />
                  </div>
                )}
              </div>
            </Card>
          );
        })()}
      </div>
    </Container>
  );
}
