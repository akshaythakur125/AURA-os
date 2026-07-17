"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
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

const GOALS: { id: AuditGoal; label: string; desc: string; icon: string; emoji: string; color: string }[] = [
  { id: "dating", label: "Dating", desc: "Optimize my photo", icon: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z", emoji: "❤️", color: "from-red-500 to-red-500" },
  { id: "instagram", label: "Instagram", desc: "Level up my grid", icon: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z", emoji: "📸", color: "from-red-500 to-red-500" },
  { id: "content", label: "Content Creator", desc: "Build my visual brand", icon: "M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z", emoji: "🎬", color: "from-red-500 to-red-500" },
  { id: "linkedin", label: "LinkedIn", desc: "Professional headshot", icon: "M16 8a6 6 0 01-12 0 6 6 0 0112 0zM2 21a8 8 0 0116 0", emoji: "💼", color: "from-blue-500 to-cyan-500" },
  { id: "college", label: "College", desc: "Stand out on campus", icon: "M12 14l9-5-9-5-9 5 9 5z", emoji: "🎓", color: "from-emerald-500 to-teal-500" },
  { id: "festival", label: "Festival / Party", desc: "Bold, photogenic look", icon: "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z", emoji: "⭐", color: "from-amber-500 to-orange-500" },
  { id: "travel", label: "Travel", desc: "Vivid travel photos", icon: "M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z", emoji: "🌍", color: "from-sky-500 to-blue-500" },
  { id: "confidence", label: "General profile", desc: "All-around presentation", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z", emoji: "🕊", color: "from-teal-500 to-emerald-500" },
  { id: "office", label: "Office", desc: "Corporate sharp look", icon: "M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z", emoji: "👔", color: "from-slate-500 to-gray-500" },
  { id: "glowup", label: "Glow-Up", desc: "Total transformation", icon: "M13 10V3L4 14h7v7l9-11h-7z", emoji: "⚡", color: "from-yellow-500 to-amber-500" },
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
          ? "border-red-500/50 bg-red-500/20 text-red-300 scale-[1.02]"
          : "border-[#1c1917]/10 text-[#6f675e] hover:border-[#1c1917]/20 hover:text-[#4a443d]"
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
  const [qualityPreview, setQualityPreview] = useState<{ score: number; label: string; color: string } | null>(null);
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
    getImageDimensions(f).then((dims) => {
      setImageDims(dims);
      // Quick quality preview
      const res = dims.width * dims.height;
      let score = 50;
      let label = 'Acceptable';
      let color = 'text-amber-400';
      if (res > 2000000) { score = 90; label = 'Excellent resolution'; color = 'text-emerald-400'; }
      else if (res > 1000000) { score = 75; label = 'Good resolution'; color = 'text-emerald-400'; }
      else if (res < 300000) { score = 25; label = 'Low resolution — results may be less accurate'; color = 'text-red-400'; }
      else { score = 50; label = 'Acceptable resolution'; color = 'text-amber-400'; }
      if (dims.width < 300 || dims.height < 300) { score = 15; label = 'Image too small — minimum 300x300'; color = 'text-red-400'; }
      setQualityPreview({ score, label, color });
    }).catch(() => {});
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
    let stage = "validating";

    try {
      // Stage 1: Validate file
      stage = "validating-file";
      if (!file || file.size === 0) {
        throw new Error("No image file available.");
      }

      // Stage 2: Compress image
      stage = "compressing-image";
      const compressed = await compressImageToDataUrl(file);
      const compressedSize = estimateDataUrlSize(compressed.dataUrl);

      // Stage 3: Create audit
      stage = "creating-audit";
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

      // Stage 4: Save audit
      stage = "saving-audit";
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

      // Stage 5: Redirect
      stage = "redirecting";
      router.push(`/audit/${audit.id}`);
    } catch (err) {
      console.error("[AuraCheck submission failed]", { stage, error: err instanceof Error ? err.message : String(err) });
      const errMsg = err instanceof Error ? err.message : String(err);
      if (stage === "compressing-image" || errMsg.includes("IMAGE") || errMsg.includes("CANVAS")) {
        setErrors(["We could not read this image. Upload the original JPEG, PNG, or WebP file. (" + stage + ")"]);
      } else if (stage === "saving-audit") {
        setErrors(["The analysis could not be saved. Please try again. (" + stage + ")"]);
      } else {
        setErrors(["Something went wrong during " + stage + ". Please try again."]);
      }
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
        <GlowOrb color="rgba(225, 68, 52, 0.1)" size={300} className="top-[10%] right-[10%]" delay={0} />
        <GlowOrb color="rgba(225, 68, 52, 0.07)" size={220} className="bottom-[15%] left-[5%]" delay={300} />

        <div className="mx-auto max-w-lg">
          {/* Progress bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              {STEPS.map((s, i) => (
                <div key={s.id} className="flex items-center gap-2">
                  <div
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium transition-all duration-300 ${
                      i === step
                        ? "bg-gradient-to-r from-red-600 to-red-500 text-[#1C1917] scale-110"
                        : i < step
                          ? "bg-red-500/30 text-red-300"
                          : "bg-[#1c1917]/[0.04] text-[#9c9184]"
                    }`}
                  >
                    {i < step ? "✓" : i + 1}
                  </div>
                  <span className={`hidden text-xs sm:inline transition-colors ${i === step ? "text-[#1C1917]" : "text-[#9c9184]"}`}>
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
            <div className="h-1 overflow-hidden rounded-full bg-[#1c1917]/[0.04]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-red-600 to-red-500 transition-all duration-500 ease-out"
                style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
              />
            </div>
            <p className="mt-2 text-center text-xs text-[#9c9184]">
              {STEPS[step].preview}
            </p>
          </div>

          {/* Step content with animated transitions */}
          <div className="relative min-h-[400px]">
            {/* Step 0: Goal */}
            {step === 0 && (
              <div className="animate-slide-in">
                <div className="mb-8 text-center">
                  <h1 className="bg-gradient-to-r from-[#1c1917] via-[#E14434] to-[#c0341f] bg-clip-text text-3xl font-bold text-transparent">
                    What&apos;s your goal?
                  </h1>
                  <p className="mt-2 text-sm text-[#857b6e]">
                    We&apos;ll personalize your results around this.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {GOALS.map((g, i) => (
                    <motion.button
                      key={g.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05, duration: 0.3 }}
                      whileHover={{ scale: 1.03, y: -2 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setGoal(g.id)}
                      className={`group relative flex flex-col items-center gap-2 rounded-2xl border p-4 text-center transition-all duration-200 ${
                        goal === g.id
                          ? "border-red-500/50 bg-red-500/10 ring-2 ring-red-500/30 shadow-lg shadow-red-500/10"
                          : "border-[#1c1917]/10 bg-[#1c1917]/[0.02] hover:border-[#1c1917]/10 hover:bg-[#1c1917]/[0.03]"
                      }`}
                    >
                      {goal === g.id && (
                        <motion.div
                          layoutId="goal-glow"
                          className="absolute inset-0 rounded-2xl bg-gradient-to-br from-red-500/10 to-red-500/5"
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                      )}
                      <div className={`relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${g.color} text-lg shadow-lg`}>
                        {g.emoji}
                      </div>
                      <div className="relative">
                        <div className="text-sm font-semibold text-[#1C1917]">{g.label}</div>
                        <div className="text-[11px] text-[#857b6e]">{g.desc}</div>
                      </div>
                      {goal === g.id && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -right-1 -top-1 h-5 w-5 rounded-full bg-gradient-to-r from-red-600 to-red-500 flex items-center justify-center shadow-md"
                        >
                          <svg className="h-3 w-3 text-[#1C1917]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </motion.div>
                      )}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 1: Upload */}
            {step === 1 && (
              <div className="animate-slide-in">
                <div className="mb-8 text-center">
                  <h1 className="bg-gradient-to-r from-[#1c1917] via-[#E14434] to-[#c0341f] bg-clip-text text-3xl font-bold text-transparent">
                    Drop your photo
                  </h1>
                  <p className="mt-2 text-sm text-[#857b6e]">
                    JPEG, PNG, or WebP. Max 8 MB.
                  </p>
                </div>

                {!previewUrl ? (
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className="group flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#1c1917]/10 bg-[#1c1917]/[0.02] p-8 sm:p-12 transition-all hover:border-red-500/30 hover:bg-[#1c1917]/[0.03]"
                  >
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1c1917]/[0.04] transition-colors group-hover:bg-red-500/10">
                      <svg className="h-7 w-7 text-[#857b6e] group-hover:text-red-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-sm text-[#6f675e]">
                      Drag & drop or <span className="text-red-400">browse</span>
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
                    <div className="overflow-hidden rounded-2xl border border-[#1c1917]/[0.08]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={previewUrl} alt="Preview" className="max-h-[320px] w-full object-contain" />
                    </div>
                    {imageDims && (
                      <p className="mt-2 text-center text-xs text-[#9c9184]">
                        {imageDims.width} &times; {imageDims.height} px
                      </p>
                    )}
                    {qualityPreview && (
                      <div className="mt-2 flex items-center justify-center gap-2">
                        <div className="h-1.5 w-24 overflow-hidden rounded-full bg-[#1c1917]/[0.04]">
                          <div className="h-full rounded-full bg-gradient-to-r from-red-600 to-red-500 transition-all" style={{ width: qualityPreview.score + '%' }} />
                        </div>
                        <span className={"text-[10px] " + qualityPreview.color}>{qualityPreview.label}</span>
                      </div>
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

                <div className="mt-4 rounded-xl border border-red-500/10 bg-red-500/5 p-3 text-center text-xs text-[#857b6e]">
                  Your image stays in this browser. Not uploaded anywhere.
                </div>
              </div>
            )}

            {/* Step 2: Personalize + Consent */}
            {step === 2 && (
              <div className="animate-slide-in">
                <div className="mb-8 text-center">
                  <h1 className="bg-gradient-to-r from-[#1c1917] via-[#E14434] to-[#c0341f] bg-clip-text text-3xl font-bold text-transparent">
                    Almost there
                  </h1>
                  <p className="mt-2 text-sm text-[#857b6e]">
                    Optional tweaks, then we analyze.
                  </p>
                </div>

                {/* Quick personalization */}
                <Card className="mb-4 p-4">
                  <h3 className="mb-3 text-sm font-semibold text-[#1C1917]">What do you want to look like?</h3>
                  <div className="flex flex-wrap gap-2">
                    {STYLE_OPTIONS.map((s) => (
                      <PillButton key={s.id} selected={styleIntent === s.id} onClick={() => setStyleIntent(s.id)}>
                        {s.label}
                      </PillButton>
                    ))}
                  </div>
                </Card>

                <Card className="mb-4 p-4">
                  <h3 className="mb-3 text-sm font-semibold text-[#1C1917]">Biggest concern?</h3>
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
                      className="h-4 w-4 rounded border-[#1c1917]/20 bg-[#1c1917]/[0.04] text-red-600 focus:ring-red-500" />
                    <span className="text-sm text-[#4a443d]">Direct/brutal feedback</span>
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
                    className="w-full rounded-lg border border-[#1c1917]/10 bg-[#1c1917]/[0.04] px-3 py-2 text-sm text-[#1C1917] placeholder-gray-600 focus:border-red-500/50 focus:outline-none"
                    rows={2}
                  />
                  {safetyError && <p className="mt-2 text-xs text-red-400">{safetyError}</p>}
                </Card>

                {/* Consent */}
                <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[#1c1917]/[0.08] bg-[#1c1917]/[0.02] p-4">
                  <input type="checkbox" checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-[#1c1917]/10 bg-[#1c1917]/[0.04] text-red-600 focus:ring-red-500/50" />
                  <span className="text-xs leading-relaxed text-[#6f675e]">
                    I own this image or have permission to analyze it. I am using AuraCheck for self-improvement. Scores are guidance, not objective truth.
                  </span>
                </label>

                <div className="mt-4 rounded-xl border border-red-500/10 bg-red-500/5 p-3 text-center text-xs text-[#857b6e]">
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
