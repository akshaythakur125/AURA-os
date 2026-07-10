"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { GlowOrb } from "@/components/ui/GlowOrb";
import { createAudit, updateAudit } from "@/lib/storage/auditStore";
import { trackEvent, EVENTS } from "@/lib/analytics/events";
import {
  validateImageFile,
  getImageDimensions,
  compressImageToDataUrl,
  estimateDataUrlSize,
} from "@/lib/image/processImage";
import type { AuditType, AuditGoal, BudgetAmount } from "@/types/audit";
import type { ImageMeta } from "@/types/audit";
import type {
  StyleIntent,
  CurrentSignalItem,
  BiggestConcern,
  OccasionContext,
  SpendComfort,
  SelfRatedConfidence,
  DeepAuditInput,
} from "@/types/personalization";
import { detectUnsafePromptText, getSafetyWarningForAudit } from "@/lib/safety/contentSafety";

const GOALS: { id: AuditGoal; label: string; desc: string; icon: string }[] = [
  { id: "dating", label: "Dating", desc: "Make my profile irresistible", icon: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" },
  { id: "instagram", label: "Instagram", desc: "Level up my grid aesthetic", icon: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" },
  { id: "college", label: "College", desc: "Stand out on campus", icon: "M12 14l9-5-9-5-9 5 9 5z" },
  { id: "office", label: "Office", desc: "Look sharp professionally", icon: "M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
  { id: "glowup", label: "General Glow-Up", desc: "Fix everything at once", icon: "M13 10V3L4 14h7v7l9-11h-7z" },
];

const STYLE_OPTIONS: { id: StyleIntent; label: string }[] = [
  { id: "premium", label: "Premium" },
  { id: "clean", label: "Clean" },
  { id: "attractive", label: "Attractive" },
  { id: "professional", label: "Professional" },
  { id: "confident", label: "Confident" },
  { id: "creator", label: "Creator" },
  { id: "college", label: "College" },
  { id: "understated", label: "Understated" },
  { id: "bold", label: "Bold" },
];

const CONCERN_OPTIONS: { id: BiggestConcern; label: string }[] = [
  { id: "looking_average", label: "I look average" },
  { id: "weak_photos", label: "Weak photos" },
  { id: "low_matches", label: "Low matches" },
  { id: "outfit_confusion", label: "Outfit confusion" },
  { id: "looking_tryhard", label: "Try-hard" },
  { id: "background_issue", label: "Weak background" },
  { id: "grooming_issue", label: "Grooming" },
  { id: "not_sure", label: "Not sure" },
];

function PillButton({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-lg border px-3 py-1.5 text-xs transition-all duration-200 ${
        selected
          ? "border-purple-500/50 bg-purple-500/20 text-purple-300 scale-[1.02]"
          : "border-white/10 text-gray-400 hover:border-white/20 hover:text-gray-300"
      }`}
    >
      {children}
    </button>
  );
}

const STEPS = [
  { id: "goal", label: "Goal", preview: "next we check your photo" },
  { id: "upload", label: "Photo", preview: "almost there — analyzing your signal" },
  { id: "personalize", label: "Personalize", preview: "final step — tailoring your results" },
];

export default function NewAuditPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const [goal, setGoal] = useState<AuditGoal | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageDims, setImageDims] = useState<{ width: number; height: number } | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [consent, setConsent] = useState(false);

  const [styleIntent, setStyleIntent] = useState<StyleIntent | null>(null);
  const [biggestConcern, setBiggestConcern] = useState<BiggestConcern | null>(null);
  const [wantsBrutalFeedback, setWantsBrutalFeedback] = useState(false);
  const [notes, setNotes] = useState("");
  const [safetyError, setSafetyError] = useState<string | null>(null);

  useEffect(() => {
    trackEvent(EVENTS.QUIZ_STARTED);
  }, []);

  const canNext = (): boolean => {
    if (step === 0) return goal !== null;
    if (step === 1) return file !== null && !imageError;
    if (step === 2) return consent && !safetyError;
    return false;
  };

  function handleFileSelect(f: File) {
    setImageError(null);
    const validation = validateImageFile(f);
    if (!validation.valid) {
      setImageError(validation.error || "Invalid file");
      setFile(null);
      setPreviewUrl(null);
      setImageDims(null);
      return;
    }
    setFile(f);
    const url = URL.createObjectURL(f);
    setPreviewUrl(url);
    getImageDimensions(f).then(setImageDims).catch(() => {});
    trackEvent(EVENTS.QUIZ_PHOTO_UPLOADED, { fileType: f.type, fileSize: f.size });
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) handleFileSelect(f);
  }

  function handleRemoveImage() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl(null);
    setImageDims(null);
    setImageError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleSubmit() {
    if (!goal || !file || !consent) return;
    setSubmitting(true);
    setErrors([]);

    try {
      const compressed = await compressImageToDataUrl(file);
      const compressedSize = estimateDataUrlSize(compressed.dataUrl);

      const imageMeta: ImageMeta = {
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        width: compressed.width,
        height: compressed.height,
        compressedSize,
      };

      const audit = createAudit({ auditType: "photo" as AuditType, goal, budgetRange: 5000 as BudgetAmount });
      trackEvent(EVENTS.QUIZ_COMPLETED, { goal, auditId: audit.id });
      const deepInput: DeepAuditInput | undefined = {
        styleIntent: styleIntent || "clean",
        currentSignals: ["none"],
        biggestConcern: biggestConcern || "not_sure",
        occasionContext: "general_profile",
        spendComfort: "under_5000",
        selfRatedConfidence: "medium",
        wantsBrutalFeedback,
        notes: notes.trim() || undefined,
      };
      updateAudit(audit.id, {
        imageDataUrl: compressed.dataUrl,
        imageMeta,
        deepInput,
      });

      router.push(`/audit/${audit.id}`);
    } catch {
      setErrors(["Something went wrong. Please try again."]);
      setSubmitting(false);
    }
  }

  function goNext() {
    if (!canNext()) return;
    if (step === 0 && goal) {
      trackEvent(EVENTS.QUIZ_GOAL_SELECTED, { goal });
    }
    if (step === STEPS.length - 1) {
      handleSubmit();
    } else {
      setStep((s) => Math.min(s + 1, STEPS.length - 1));
    }
  }

  function goBack() {
    setStep((s) => Math.max(s - 1, 0));
  }

  return (
    <>
      <div className="aurora-mesh" />
      <Container className="relative py-8">
        <GlowOrb color="rgba(147, 51, 234, 0.1)" size={300} className="top-[10%] right-[10%]" delay={0} />
        <GlowOrb color="rgba(236, 72, 153, 0.07)" size={220} className="bottom-[15%] left-[5%]" delay={300} />

        <div className="mx-auto max-w-lg">
          {/* Progress bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              {STEPS.map((s, i) => (
                <div key={s.id} className="flex items-center gap-2">
                  <div
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium transition-all duration-300 ${
                      i === step
                        ? "bg-gradient-to-r from-purple-600 to-pink-500 text-white scale-110"
                        : i < step
                          ? "bg-purple-500/30 text-purple-300"
                          : "bg-white/5 text-gray-600"
                    }`}
                  >
                    {i < step ? "✓" : i + 1}
                  </div>
                  <span className={`hidden text-xs sm:inline transition-colors ${i === step ? "text-white" : "text-gray-600"}`}>
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
            <div className="h-1 overflow-hidden rounded-full bg-white/5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-purple-600 to-pink-500 transition-all duration-500 ease-out"
                style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
              />
            </div>
            <p className="mt-2 text-center text-xs text-gray-600">
              {STEPS[step].preview}
            </p>
          </div>

          {/* Step content with animated transitions */}
          <div className="relative min-h-[400px]">
            {/* Step 0: Goal */}
            {step === 0 && (
              <div className="animate-slide-in">
                <div className="mb-8 text-center">
                  <h1 className="bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-3xl font-bold text-transparent">
                    What&apos;s your goal?
                  </h1>
                  <p className="mt-2 text-sm text-gray-500">
                    We&apos;ll personalize your results around this.
                  </p>
                </div>
                <div className="grid gap-3">
                  {GOALS.map((g) => (
                    <button
                      key={g.id}
                      onClick={() => setGoal(g.id)}
                      className={`group flex items-center gap-4 rounded-xl border p-4 text-left transition-all duration-200 ${
                        goal === g.id
                          ? "border-purple-500/50 bg-purple-500/10 ring-1 ring-purple-500/20"
                          : "border-white/[0.04] bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.04]"
                      }`}
                    >
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${
                        goal === g.id
                          ? "bg-gradient-to-br from-purple-600 to-pink-500"
                          : "bg-white/5 group-hover:bg-white/10"
                      }`}>
                        <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={g.icon} />
                        </svg>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white">{g.label}</div>
                        <div className="text-xs text-gray-500">{g.desc}</div>
                      </div>
                      {goal === g.id && (
                        <div className="ml-auto">
                          <div className="h-5 w-5 rounded-full bg-gradient-to-r from-purple-600 to-pink-500 flex items-center justify-center">
                            <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 1: Upload */}
            {step === 1 && (
              <div className="animate-slide-in">
                <div className="mb-8 text-center">
                  <h1 className="bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-3xl font-bold text-transparent">
                    Drop your photo
                  </h1>
                  <p className="mt-2 text-sm text-gray-500">
                    JPEG, PNG, or WebP. Max 8 MB.
                  </p>
                </div>

                {!previewUrl ? (
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className="group flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/10 bg-white/[0.02] p-12 transition-all hover:border-purple-500/30 hover:bg-white/[0.04]"
                  >
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 transition-colors group-hover:bg-purple-500/10">
                      <svg className="h-7 w-7 text-gray-500 group-hover:text-purple-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-sm text-gray-400">
                      Drag & drop or <span className="text-purple-400">browse</span>
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileSelect(f); }}
                    />
                  </div>
                ) : (
                  <div className="relative">
                    <div className="overflow-hidden rounded-2xl border border-white/[0.04]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={previewUrl} alt="Preview" className="max-h-[320px] w-full object-contain" />
                    </div>
                    {imageDims && (
                      <p className="mt-2 text-center text-xs text-gray-600">
                        {imageDims.width} &times; {imageDims.height} px
                      </p>
                    )}
                    <div className="mt-3 flex justify-center gap-3">
                      <Button variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()}>Replace</Button>
                      <Button variant="ghost" size="sm" onClick={handleRemoveImage}>Remove</Button>
                      <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
                        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileSelect(f); }} />
                    </div>
                  </div>
                )}

                {imageError && <p className="mt-3 text-center text-sm text-red-400">{imageError}</p>}

                <div className="mt-4 rounded-xl border border-purple-500/10 bg-purple-500/5 p-3 text-center text-xs text-gray-500">
                  Your image stays in this browser. Not uploaded anywhere.
                </div>
              </div>
            )}

            {/* Step 2: Personalize + Consent */}
            {step === 2 && (
              <div className="animate-slide-in">
                <div className="mb-8 text-center">
                  <h1 className="bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-3xl font-bold text-transparent">
                    Almost there
                  </h1>
                  <p className="mt-2 text-sm text-gray-500">
                    Optional tweaks, then we analyze.
                  </p>
                </div>

                {/* Quick personalization */}
                <Card className="mb-4 p-4">
                  <h3 className="mb-3 text-sm font-semibold text-white">What do you want to look like?</h3>
                  <div className="flex flex-wrap gap-2">
                    {STYLE_OPTIONS.map((s) => (
                      <PillButton key={s.id} selected={styleIntent === s.id} onClick={() => setStyleIntent(s.id)}>
                        {s.label}
                      </PillButton>
                    ))}
                  </div>
                </Card>

                <Card className="mb-4 p-4">
                  <h3 className="mb-3 text-sm font-semibold text-white">Biggest concern?</h3>
                  <div className="flex flex-wrap gap-2">
                    {CONCERN_OPTIONS.map((c) => (
                      <PillButton key={c.id} selected={biggestConcern === c.id} onClick={() => setBiggestConcern(c.id)}>
                        {c.label}
                      </PillButton>
                    ))}
                  </div>
                </Card>

                <Card className="mb-4 p-4">
                  <label className="flex cursor-pointer items-center gap-3">
                    <input type="checkbox" checked={wantsBrutalFeedback}
                      onChange={(e) => setWantsBrutalFeedback(e.target.checked)}
                      className="h-4 w-4 rounded border-white/20 bg-white/5 text-purple-600 focus:ring-purple-500" />
                    <span className="text-sm text-gray-300">Direct/brutal feedback</span>
                  </label>
                </Card>

                <Card className="mb-4 p-4">
                  <textarea
                    value={notes}
                    onChange={(e) => {
                      const text = e.target.value;
                      setNotes(text);
                      const result = detectUnsafePromptText(text);
                      setSafetyError(result.unsafe ? "AuraCheck analyzes presentation for self-improvement, not to shame or judge." : null);
                    }}
                    placeholder="Anything specific to consider? (optional)"
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-purple-500/50 focus:outline-none"
                    rows={2}
                  />
                  {safetyError && <p className="mt-2 text-xs text-red-400">{safetyError}</p>}
                </Card>

                {/* Consent */}
                <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/[0.04] bg-white/[0.02] p-4">
                  <input type="checkbox" checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-white/10 bg-white/5 text-purple-600 focus:ring-purple-500/50" />
                  <span className="text-xs leading-relaxed text-gray-400">
                    I own this image or have permission to analyze it. I am using AuraCheck for self-improvement. Scores are guidance, not objective truth.
                  </span>
                </label>

                <div className="mt-4 rounded-xl border border-purple-500/10 bg-purple-500/5 p-3 text-center text-xs text-gray-500">
                  All fields on this step are optional except consent.
                </div>
              </div>
            )}
          </div>

          {/* Errors */}
          {errors.length > 0 && (
            <div className="mb-4 space-y-1">
              {errors.map((e) => <p key={e} className="text-sm text-red-400">{e}</p>)}
            </div>
          )}

          {/* Navigation */}
          <div className="mt-6 flex items-center justify-between">
            <div>
              {step > 0 && (
                <Button variant="ghost" onClick={goBack}>Back</Button>
              )}
            </div>
            <Button onClick={goNext} disabled={!canNext() || submitting}>
              {submitting
                ? "Analyzing..."
                : step === STEPS.length - 1
                  ? "Analyze my photo"
                  : "Next"}
            </Button>
          </div>
        </div>
      </Container>
    </>
  );
}
