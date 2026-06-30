"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { TwinVariantCard } from "@/components/aura-twin/TwinVariantCard";
import { TwinComparisonGrid } from "@/components/aura-twin/TwinComparisonGrid";
import { createTwinVariants } from "@/lib/aura-twin/createTwinVariants";
import { rankTwinVariants } from "@/lib/aura-twin/rankTwinVariants";
import { buildTwinStrategy } from "@/lib/aura-twin/buildTwinStrategy";
import { createTwinResult, getLatestTwinResult } from "@/lib/storage/auraTwinStore";
import { getAudits, createAudit } from "@/lib/storage/auditStore";
import { validateImage, processImage } from "@/lib/image/processImage";
import { trackEvent } from "@/lib/storage/analyticsStore";
import type { TwinGoal, AuraTwinVariant } from "@/types/auraTwin";
import { TWIN_GOAL_LABELS } from "@/types/auraTwin";
import type { AuditType, Goal, BudgetRange } from "@/types";

function mapTwinGoalToAuditGoal(goal: TwinGoal): Goal {
  const map: Record<TwinGoal, Goal> = {
    dating_profile: "dating",
    instagram: "instagram",
    professional: "office",
    college_social: "college",
    creator: "instagram",
    general: "glowup",
  };
  return map[goal] || "glowup";
}

function mapTwinGoalToAuditType(goal: TwinGoal): AuditType {
  if (goal === "dating_profile") return "dating";
  if (goal === "professional") return "photo";
  return "photo";
}

const GOALS: { id: TwinGoal; label: string }[] = [
  { id: "dating_profile", label: "Dating Profile" },
  { id: "instagram", label: "Instagram" },
  { id: "professional", label: "Professional" },
  { id: "college_social", label: "College / Social" },
  { id: "creator", label: "Creator" },
  { id: "general", label: "General" },
];

export default function TwinSimulatorPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [imageMeta, setImageMeta] = useState<{ fileName: string; fileType: string; fileSize: number; compressedSize: number; width: number; height: number } | null>(null);
  const [goal, setGoal] = useState<TwinGoal>("general");
  const [processing, setProcessing] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<{
    variants: AuraTwinVariant[];
    rankedIds: string[];
    bestVariantId: string;
    originalScore: number;
    bestScore: number;
    bestDelta: number;
    freeUpgradeWinner: string;
    paidUpgradeWinner: string;
    statusRoiSummary: string;
    avoidForNow: string;
    finalStrategy: string;
  } | null>(null);
  const [savedResultId, setSavedResultId] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    trackEvent("aura_twin_page_viewed");
  }, []);

  const audits = typeof window !== "undefined" ? getAudits() : [];
  const latestAudit = audits.length > 0 ? audits[0] : null;

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
      .then((result) => {
        setImageDataUrl(result.dataUrl);
        setImageMeta(result.meta);
        setProcessing(false);
        setResult(null);
        setSavedResultId(null);
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
    setResult(null);
    setSavedResultId(null);
  }

  function handleRemoveImage() {
    setImageDataUrl(null);
    setImageMeta(null);
    setResult(null);
    setSavedResultId(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleAnalyze() {
    if (!imageDataUrl) return;
    setError(null);
    setAnalyzing(true);

    try {
      const variants = await createTwinVariants(imageDataUrl);
      const rankedIds = rankTwinVariants({ variants, goal });
      const original = variants.find((v) => v.type === "original")!;
      const { bestVariantId, freeUpgradeWinner, paidUpgradeWinner, statusRoiSummary, avoidForNow, finalStrategy } =
        buildTwinStrategy({ variants, originalScore: original.score, goal });
      const best = variants.find((v) => v.id === bestVariantId)!;

      setResult({
        variants,
        rankedIds,
        bestVariantId,
        originalScore: original.score,
        bestScore: best.score,
        bestDelta: best.scoreDelta,
        freeUpgradeWinner,
        paidUpgradeWinner,
        statusRoiSummary,
        avoidForNow,
        finalStrategy,
      });

      trackEvent("aura_twin_generated");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setAnalyzing(false);
    }
  }

  function handleSaveResult() {
    if (!result || !imageDataUrl) return;
    const saved = createTwinResult({
      sourceAuditId: latestAudit?.id,
      originalImageDataUrl: imageDataUrl,
      originalScore: result.originalScore,
      bestVariantId: result.bestVariantId,
      variants: result.variants,
      rankedVariantIds: result.rankedIds,
      freeUpgradeWinner: result.freeUpgradeWinner,
      paidUpgradeWinner: result.paidUpgradeWinner,
      statusRoiSummary: result.statusRoiSummary,
      avoidForNow: result.avoidForNow,
      finalStrategy: result.finalStrategy,
      goal,
    });
    setSavedResultId(saved.id);
    trackEvent("aura_twin_saved");
  }

  function handleCopyStrategy() {
    if (!result) return;
    let text = "Aura Twin Strategy\n";
    text += "===================\n\n";
    text += `Original Score: ${result.originalScore}\n`;
    text += `Best Improvement: +${result.bestDelta} points\n\n`;
    text += `Strategy:\n${result.finalStrategy}\n\n`;
    text += `ROI Summary:\n${result.statusRoiSummary}\n\n`;
    text += `What to avoid:\n${result.avoidForNow}\n`;

    navigator.clipboard.writeText(text).then(() => {
      setCopyStatus("Strategy copied!");
      trackEvent("aura_twin_strategy_copied");
      setTimeout(() => setCopyStatus(null), 2000);
    }).catch(() => {
      setCopyStatus("Copy failed");
      setTimeout(() => setCopyStatus(null), 2000);
    });
  }

  function handleCreateAuditFromBest() {
    if (!result) return;
    const best = result.variants.find((v) => v.id === result.bestVariantId);
    if (!best) return;

    const auditGoal = mapTwinGoalToAuditGoal(goal);
    const auditType = mapTwinGoalToAuditType(goal);

    const audit = createAudit({
      auditType,
      goal: auditGoal,
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

  return (
    <Container className="py-8 sm:py-12">
      <div className="mx-auto max-w-4xl">
        {/* ─── Hero ─── */}
        <div className="mb-8 text-center">
          <h1 className="mb-3 text-4xl font-bold text-white">Aura Twin Simulator</h1>
          <p className="mx-auto max-w-xl text-sm text-gray-400">
            See which visual upgrade could improve your Aura Score before spending money.
          </p>
        </div>

        {/* ─── Safety Note ─── */}
        <div className="mb-8 rounded-xl border border-purple-500/10 bg-purple-500/5 px-4 py-3 text-xs text-gray-500">
          <p className="mb-1 font-medium text-purple-300/80">Important</p>
          <p>These previews are local canvas simulations to show likely direction, not final professional retouching. Aura Twin ranks presentation quality, not human worth. This does not infer caste, religion, ethnicity, sexuality, health, exact income, or protected traits. No external AI service is used. Your image stays in this browser. Predicted score changes are guidance, not objective truth.</p>
        </div>

        {/* ─── Section 1: Upload / Select ─── */}
        <Card className="mb-6">
          <h2 className="mb-4 text-lg font-semibold text-white">1. Choose your photo</h2>

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
                className="mb-4 max-h-64 w-full rounded-xl object-contain"
              />
              <div className="flex flex-wrap gap-2">
                <Button variant="ghost" size="sm" onClick={() => fileInputRef.current?.click()}>
                  Replace Image
                </Button>
                <Button variant="ghost" size="sm" onClick={handleRemoveImage}>
                  Remove
                </Button>
                {latestAudit && !result && (
                  <Button variant="ghost" size="sm" onClick={handleUseLatestAudit}>
                    Switch to Latest Audit
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
                  <p className="text-sm text-gray-600">No previous audits found</p>
                  <p className="text-xs text-gray-700">Create an audit first or upload a new photo</p>
                </div>
              )}
            </div>
          )}
        </Card>

        {/* ─── Section 2: Goal ─── */}
        <Card className="mb-6">
          <h2 className="mb-4 text-lg font-semibold text-white">2. What&apos;s your goal?</h2>
          <div className="flex flex-wrap gap-2">
            {GOALS.map((g) => {
              const selected = goal === g.id;
              return (
                <button
                  key={g.id}
                  onClick={() => setGoal(g.id)}
                  className={`rounded-xl border px-4 py-2 text-sm transition-all ${
                    selected
                      ? "border-purple-500/50 bg-purple-500/10 text-purple-300 ring-1 ring-purple-500/30"
                      : "border-white/10 text-gray-400 hover:border-white/20 hover:text-white"
                  }`}
                >
                  {TWIN_GOAL_LABELS[g.id] || g.label}
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
                Generating variants...
              </span>
            ) : (
              "Analyze & Simulate Variants"
            )}
          </Button>
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
            {/* ─── Current Score ─── */}
            <div className="grid gap-4 sm:grid-cols-3">
              <Card>
                <div className="text-xs text-gray-500">Current Score</div>
                <div className="mt-1 text-3xl font-bold text-white">{result.originalScore}</div>
              </Card>
              <Card className="border-emerald-500/20">
                <div className="text-xs text-gray-500">Best Predicted Score</div>
                <div className="mt-1 text-3xl font-bold text-emerald-400">{result.bestScore}</div>
              </Card>
              <Card className="border-purple-500/20">
                <div className="text-xs text-gray-500">Improvement</div>
                <div className="mt-1 text-3xl font-bold text-purple-400">+{result.bestDelta}</div>
              </Card>
            </div>

            {/* ─── Best Variant ─── */}
            <div>
              <h2 className="mb-4 text-lg font-semibold text-white">Best Predicted Improvement</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  {(() => {
                    const best = result.variants.find((v) => v.id === result.bestVariantId);
                    if (!best) return null;
                    return <TwinVariantCard variant={best} isBest />;
                  })()}
                </div>
                <div className="space-y-3">
                  <div className="rounded-xl bg-emerald-500/10 p-4 text-sm text-emerald-300">
                    <p className="font-semibold">+{result.bestDelta} points</p>
                    <p className="mt-1 text-xs text-emerald-400/70">by fixing lighting and crop before buying anything.</p>
                  </div>
                  <div className="rounded-xl bg-purple-500/10 p-4 text-xs text-purple-300">
                    {result.finalStrategy}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" onClick={handleSaveResult}>
                      {savedResultId ? "Saved ✓" : "Save Twin Result"}
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleCopyStrategy}>
                      {copyStatus || "Copy Strategy"}
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleCreateAuditFromBest}>
                      Create Audit from Best
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* ─── Variant Comparison Grid ─── */}
            <div>
              <h2 className="mb-4 text-lg font-semibold text-white">All Variants Compared</h2>
              <TwinComparisonGrid
                variants={result.variants}
                bestVariantId={result.bestVariantId}
                rankedIds={result.rankedIds}
              />
              <p className="mt-3 text-xs text-gray-600 text-center">
                These previews are local canvas simulations to show likely direction, not final professional retouching. Your image never leaves this browser.
              </p>
            </div>

            {/* ─── Status ROI Summary ─── */}
            <Card className="border-amber-500/20">
              <h2 className="mb-3 text-lg font-semibold text-white">Status ROI Summary</h2>
              <p className="text-sm text-gray-300">{result.statusRoiSummary}</p>
            </Card>

            {/* ─── What to Fix First ─── */}
            {(() => {
              const best = result.variants.find((v) => v.id === result.bestVariantId);
              if (!best) return null;
              return (
                <Card className="border-emerald-500/20">
                  <h2 className="mb-3 text-lg font-semibold text-white">What to Fix First</h2>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2 text-sm text-gray-300">
                      <span className="mt-0.5 text-emerald-400">✓</span>
                      <span><strong className="text-white">{best.freeFix.split(".")[0]}</strong> — {best.freeFix}</span>
                    </li>
                    {best.paidFix && (
                      <li className="flex items-start gap-2 text-sm text-gray-400">
                        <span className="mt-0.5 text-amber-400">₹</span>
                        <span>{best.paidFix}</span>
                      </li>
                    )}
                  </ul>
                </Card>
              );
            })()}

            {/* ─── What Not to Spend On ─── */}
            <Card className="border-red-500/15">
              <h2 className="mb-3 text-lg font-semibold text-white">What Not to Spend On Yet</h2>
              <p className="text-sm text-gray-400">{result.avoidForNow}</p>
            </Card>

            {/* ─── Print / Download ─── */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.print()}
              >
                Print Twin Report
              </Button>
            </div>
          </div>
        )}

        {/* ─── Latest Saved Result Preview ─── */}
        {!result && (() => {
          const latestTwin = typeof window !== "undefined" ? getLatestTwinResult() : undefined;
          if (!latestTwin) return null;
          const best = latestTwin.variants.find((v) => v.id === latestTwin.bestVariantId);
          return (
            <Card className="border-purple-500/20">
              <h2 className="mb-3 text-lg font-semibold text-white">Your Last Aura Twin</h2>
              <div className="grid gap-3 sm:grid-cols-3 text-sm">
                <div>
                  <div className="text-xs text-gray-500">Original Score</div>
                  <div className="text-xl font-bold text-white">{latestTwin.originalScore}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Best Score</div>
                  <div className="text-xl font-bold text-emerald-400">
                    {best ? best.score : "—"}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Best Fix</div>
                  <div className="text-sm text-purple-300">{best?.title || "—"}</div>
                </div>
              </div>
            </Card>
          );
        })()}
      </div>
    </Container>
  );
}
