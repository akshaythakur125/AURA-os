"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { createAudit, updateAudit } from "@/lib/storage/auditStore";
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

const AUDIT_TYPES: { id: AuditType; label: string; desc: string; gradient: string; icon: string }[] = [
  { id: "photo", label: "Photo Aura Check", desc: "Analyze a single photo for expression, lighting, background, and overall visual signal.", gradient: "from-purple-600 to-pink-500", icon: "camera" },
  { id: "instagram", label: "Instagram Profile Audit", desc: "Review your Instagram profile for coherence, photo quality, bio signals, and grid presentation.", gradient: "from-pink-500 to-rose-500", icon: "instagram" },
  { id: "dating", label: "Dating Profile Audit", desc: "Optimize your dating app profile — photo order, bio alignment, and platform-specific signals.", gradient: "from-rose-500 to-red-500", icon: "heart" },
  { id: "outfit", label: "Outfit Audit", desc: "Evaluate outfit choices for fit, color coordination, occasion alignment, and overall style signal.", gradient: "from-amber-500 to-orange-500", icon: "tag" },
  { id: "room", label: "Room / Background Audit", desc: "Check your background and environment for visual noise, lighting, and lifestyle signals.", gradient: "from-emerald-500 to-teal-500", icon: "home" },
];

const GOALS: { id: AuditGoal; label: string }[] = [
  { id: "dating", label: "Dating" },
  { id: "instagram", label: "Instagram" },
  { id: "college", label: "College" },
  { id: "office", label: "Office" },
  { id: "glowup", label: "General Glow-Up" },
];

const BUDGETS: { id: BudgetAmount; label: string }[] = [
  { id: 0, label: "₹0 — Free only" },
  { id: 2000, label: "₹2,000" },
  { id: 5000, label: "₹5,000" },
  { id: 10000, label: "₹10,000" },
  { id: 25000, label: "₹25,000+" },
];

const STEPS = ["Type", "Goal", "Budget", "Personalize", "Image", "Review"];

const STYLE_OPTIONS: { id: StyleIntent; label: string }[] = [
  { id: "premium", label: "Premium" },
  { id: "clean", label: "Clean" },
  { id: "attractive", label: "Attractive" },
  { id: "professional", label: "Professional" },
  { id: "confident", label: "Confident" },
  { id: "creator", label: "Creator-like" },
  { id: "college", label: "College-ready" },
  { id: "understated", label: "Understated" },
  { id: "bold", label: "Bold" },
];

const SIGNAL_OPTIONS: { id: CurrentSignalItem; label: string }[] = [
  { id: "phone_visible", label: "Phone visible" },
  { id: "watch_visible", label: "Watch visible" },
  { id: "shoes_visible", label: "Shoes visible" },
  { id: "branded_item_visible", label: "Branded item visible" },
  { id: "bike_car_visible", label: "Bike/car visible" },
  { id: "gym_body_signal", label: "Gym/body signal" },
  { id: "travel_signal", label: "Travel signal" },
  { id: "cafe_signal", label: "Café/social signal" },
  { id: "room_signal", label: "Room/background signal" },
  { id: "none", label: "None" },
];

const CONCERN_OPTIONS: { id: BiggestConcern; label: string }[] = [
  { id: "looking_average", label: "I look average" },
  { id: "weak_photos", label: "My photos are weak" },
  { id: "low_matches", label: "I get low matches" },
  { id: "poor_instagram", label: "My Instagram looks poor" },
  { id: "outfit_confusion", label: "I don't know what to wear" },
  { id: "looking_tryhard", label: "I look try-hard" },
  { id: "background_issue", label: "My background is weak" },
  { id: "grooming_issue", label: "Grooming issue" },
  { id: "not_sure", label: "Not sure" },
];

const OCCASION_OPTIONS: { id: OccasionContext; label: string }[] = [
  { id: "dating_profile", label: "Dating profile" },
  { id: "instagram_post", label: "Instagram post" },
  { id: "college_daily", label: "College daily/social life" },
  { id: "office_profile", label: "Office/professional profile" },
  { id: "party_event", label: "Party/event" },
  { id: "family_function", label: "Family function" },
  { id: "creator_content", label: "Creator content" },
  { id: "general_profile", label: "General profile" },
];

const SPEND_OPTIONS: { id: SpendComfort; label: string }[] = [
  { id: "no_spend", label: "No spend" },
  { id: "under_2000", label: "Under ₹2,000" },
  { id: "under_5000", label: "Under ₹5,000" },
  { id: "under_10000", label: "Under ₹10,000" },
  { id: "flexible", label: "Flexible" },
];

const CONFIDENCE_OPTIONS: { id: SelfRatedConfidence; label: string }[] = [
  { id: "low", label: "Low" },
  { id: "medium", label: "Medium" },
  { id: "high", label: "High" },
];

function Icon({ name }: { name: string }) {
  const paths: Record<string, string> = {
    camera: "M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    instagram: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z",
    heart: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z",
    tag: "M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z",
    home: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
  };
  return (
    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={paths[name] || paths.camera} />
    </svg>
  );
}

function PillButton({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-lg border px-3 py-1.5 text-xs transition-colors ${
        selected
          ? "border-purple-500/50 bg-purple-500/20 text-purple-300"
          : "border-white/10 text-gray-400 hover:border-white/20"
      }`}
    >
      {children}
    </button>
  );
}

export default function NewAuditPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const [auditType, setAuditType] = useState<AuditType | null>(null);
  const [goal, setGoal] = useState<AuditGoal | null>(null);
  const [budget, setBudget] = useState<BudgetAmount | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageDims, setImageDims] = useState<{ width: number; height: number } | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [consent, setConsent] = useState(false);

  // Personalization state
  const [styleIntent, setStyleIntent] = useState<StyleIntent | null>(null);
  const [currentSignals, setCurrentSignals] = useState<CurrentSignalItem[]>([]);
  const [biggestConcern, setBiggestConcern] = useState<BiggestConcern | null>(null);
  const [occasionContext, setOccasionContext] = useState<OccasionContext | null>(null);
  const [spendComfort, setSpendComfort] = useState<SpendComfort | null>(null);
  const [selfRatedConfidence, setSelfRatedConfidence] = useState<SelfRatedConfidence | null>(null);
  const [wantsBrutalFeedback, setWantsBrutalFeedback] = useState(false);
  const [notes, setNotes] = useState("");
  const [personalizationSkipped, setPersonalizationSkipped] = useState(false);

  const canNext = (): boolean => {
    switch (step) {
      case 0: return auditType !== null;
      case 1: return goal !== null;
      case 2: return budget !== null;
      case 3: return true; // optional
      case 4: return file !== null && !imageError;
      case 5: return consent;
      default: return false;
    }
  };

  function buildDeepInput(): DeepAuditInput | undefined {
    if (personalizationSkipped) return undefined;
    return {
      styleIntent: styleIntent || "clean",
      currentSignals: currentSignals.length > 0 ? currentSignals : ["none"],
      biggestConcern: biggestConcern || "not_sure",
      occasionContext: occasionContext || "general_profile",
      spendComfort: spendComfort || "under_5000",
      selfRatedConfidence: selfRatedConfidence || "medium",
      wantsBrutalFeedback,
      notes: notes.trim() || undefined,
    };
  }

  function toggleSignal(signal: CurrentSignalItem) {
    if (signal === "none") {
      setCurrentSignals(["none"]);
      return;
    }
    setCurrentSignals((prev) => {
      const filtered = prev.filter((s) => s !== "none");
      if (filtered.includes(signal)) {
        return filtered.filter((s) => s !== signal);
      }
      return [...filtered, signal];
    });
  }

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
    if (!auditType || !goal || budget === null || !file || !consent) return;
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

      const audit = createAudit({ auditType, goal, budgetRange: budget });
      const deepInput = buildDeepInput();
      updateAudit(audit.id, {
        imageDataUrl: compressed.dataUrl,
        imageMeta,
        deepInput,
      });

      router.push(`/audit/${audit.id}`);
    } catch {
      setErrors(["Something went wrong while processing the image. Please try again."]);
      setSubmitting(false);
    }
  }

  function goNext() {
    if (!canNext()) return;
    if (step === STEPS.length - 1) {
      handleSubmit();
    } else {
      setStep((s) => Math.min(s + 1, STEPS.length - 1));
    }
  }

  return (
    <Container className="py-12">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 text-center">
          <h1 className="bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-3xl font-bold text-transparent sm:text-4xl">
            New Aura Check
          </h1>
          <p className="mt-2 text-gray-400">
            Select what you want to audit, upload your image, and personalize your results.
          </p>
        </div>

        {/* Progress */}
        <div className="mb-10 flex items-center justify-center gap-1 sm:gap-2">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center gap-1 sm:gap-2">
              <div
                className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-xs font-medium transition-colors sm:h-9 sm:w-9 ${
                  i === step
                    ? "bg-gradient-to-r from-purple-600 to-pink-500 text-white"
                    : i < step
                      ? "bg-purple-500/20 text-purple-300"
                      : "bg-white/5 text-gray-600"
                }`}
                onClick={() => { if (i < step) setStep(i); }}
              >
                {i + 1}
              </div>
              <span
                className={`hidden text-xs sm:inline ${i === step ? "text-white" : "text-gray-600"}`}
              >
                {label}
              </span>
              {i < STEPS.length - 1 && (
                <div className={`mx-1 h-px w-6 sm:w-10 ${i < step ? "bg-purple-500/40" : "bg-white/5"}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step 0: Audit Type */}
        {step === 0 && (
          <div>
            <h2 className="mb-6 text-center text-lg font-semibold text-white">
              What do you want to audit?
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {AUDIT_TYPES.map((t) => (
                <Card
                  key={t.id}
                  hover
                  className={`cursor-pointer transition-all duration-200 ${
                    auditType === t.id ? "border-purple-500/50 ring-1 ring-purple-500/30" : ""
                  }`}
                  onClick={() => setAuditType(t.id)}
                >
                  <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${t.gradient}`}>
                    <Icon name={t.icon} />
                  </div>
                  <h3 className="mb-1 text-sm font-semibold text-white">{t.label}</h3>
                  <p className="text-xs text-gray-400">{t.desc}</p>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Step 1: Goal */}
        {step === 1 && (
          <div>
            <h2 className="mb-6 text-center text-lg font-semibold text-white">
              What is your goal?
            </h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {GOALS.map((g) => (
                <Card
                  key={g.id}
                  hover
                  className={`cursor-pointer text-center transition-all duration-200 ${
                    goal === g.id ? "border-purple-500/50 ring-1 ring-purple-500/30" : ""
                  }`}
                  onClick={() => setGoal(g.id)}
                >
                  <h3 className="text-sm font-semibold text-white capitalize">{g.label}</h3>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Budget */}
        {step === 2 && (
          <div>
            <h2 className="mb-6 text-center text-lg font-semibold text-white">
              What is your upgrade budget?
            </h2>
            <p className="mb-6 text-center text-sm text-gray-500">
              This helps us tailor suggestions to your range.
            </p>
            <div className="grid gap-4 sm:grid-cols-3">
              {BUDGETS.map((b) => (
                <Card
                  key={b.id}
                  hover
                  className={`cursor-pointer text-center transition-all duration-200 ${
                    budget === b.id ? "border-purple-500/50 ring-1 ring-purple-500/30" : ""
                  }`}
                  onClick={() => setBudget(b.id)}
                >
                  <h3 className="text-sm font-semibold text-white">{b.label}</h3>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Personalization */}
        {step === 3 && (
          <div>
            <h2 className="mb-2 text-center text-lg font-semibold text-white">
              Personalize your Aura Check
            </h2>
            <p className="mb-6 text-center text-sm text-gray-500">
              Help us tailor your results. All fields are optional.
            </p>

            {personalizationSkipped ? (
              <Card className="py-8 text-center">
                <p className="mb-4 text-sm text-gray-400">Personalization skipped.</p>
                <Button size="sm" variant="secondary" onClick={() => setPersonalizationSkipped(false)}>
                  Add Personalization
                </Button>
              </Card>
            ) : (
              <div className="space-y-6">
                {/* A. Style Intent */}
                <Card>
                  <h3 className="mb-3 text-sm font-semibold text-white">What do you want to look like?</h3>
                  <div className="flex flex-wrap gap-2">
                    {STYLE_OPTIONS.map((s) => (
                      <PillButton key={s.id} selected={styleIntent === s.id} onClick={() => setStyleIntent(s.id)}>
                        {s.label}
                      </PillButton>
                    ))}
                  </div>
                </Card>

                {/* B. Current Signals */}
                <Card>
                  <h3 className="mb-3 text-sm font-semibold text-white">What visible signals are currently part of your look?</h3>
                  <p className="mb-3 text-xs text-gray-500">Select all that apply.</p>
                  <div className="flex flex-wrap gap-2">
                    {SIGNAL_OPTIONS.map((s) => (
                      <PillButton key={s.id} selected={currentSignals.includes(s.id)} onClick={() => toggleSignal(s.id)}>
                        {s.label}
                      </PillButton>
                    ))}
                  </div>
                </Card>

                {/* C. Biggest Concern */}
                <Card>
                  <h3 className="mb-3 text-sm font-semibold text-white">What is your biggest concern?</h3>
                  <div className="flex flex-wrap gap-2">
                    {CONCERN_OPTIONS.map((c) => (
                      <PillButton key={c.id} selected={biggestConcern === c.id} onClick={() => setBiggestConcern(c.id)}>
                        {c.label}
                      </PillButton>
                    ))}
                  </div>
                </Card>

                {/* D. Occasion Context */}
                <Card>
                  <h3 className="mb-3 text-sm font-semibold text-white">Where will this image/profile be used?</h3>
                  <div className="flex flex-wrap gap-2">
                    {OCCASION_OPTIONS.map((o) => (
                      <PillButton key={o.id} selected={occasionContext === o.id} onClick={() => setOccasionContext(o.id)}>
                        {o.label}
                      </PillButton>
                    ))}
                  </div>
                </Card>

                {/* E. Spend Comfort */}
                <Card>
                  <h3 className="mb-3 text-sm font-semibold text-white">What is your spending comfort?</h3>
                  <div className="flex flex-wrap gap-2">
                    {SPEND_OPTIONS.map((s) => (
                      <PillButton key={s.id} selected={spendComfort === s.id} onClick={() => setSpendComfort(s.id)}>
                        {s.label}
                      </PillButton>
                    ))}
                  </div>
                </Card>

                {/* F. Self-rated confidence */}
                <Card>
                  <h3 className="mb-3 text-sm font-semibold text-white">Self-rated confidence</h3>
                  <div className="flex flex-wrap gap-2">
                    {CONFIDENCE_OPTIONS.map((c) => (
                      <PillButton key={c.id} selected={selfRatedConfidence === c.id} onClick={() => setSelfRatedConfidence(c.id)}>
                        {c.label}
                      </PillButton>
                    ))}
                  </div>
                </Card>

                {/* G. Feedback style */}
                <Card>
                  <label className="flex cursor-pointer items-center gap-3">
                    <input
                      type="checkbox"
                      checked={wantsBrutalFeedback}
                      onChange={(e) => setWantsBrutalFeedback(e.target.checked)}
                      className="h-4 w-4 rounded border-white/20 bg-white/5 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-300">I want direct/brutal but useful feedback</span>
                  </label>
                </Card>

                {/* H. Notes */}
                <Card>
                  <label className="mb-2 block text-sm font-semibold text-white">Anything specific you want AuraCheck to consider?</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Optional — e.g., 'I have an important event coming up' or 'I mainly use this photo on LinkedIn'"
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-purple-500/50 focus:outline-none"
                    rows={3}
                  />
                </Card>

                <div className="rounded-xl border border-purple-500/10 bg-purple-500/5 p-4 text-center text-xs text-gray-400">
                  We do not ask for caste, religion, ethnicity, sexuality, health details, or exact income.
                  AuraCheck only uses your selected presentation goals and image-quality signals.
                </div>
              </div>
            )}

            <div className="mt-6 flex justify-center">
              {!personalizationSkipped && (
                <Button variant="ghost" size="sm" onClick={() => setPersonalizationSkipped(true)}>
                  Skip Personalization
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Step 4: Image Upload */}
        {step === 4 && (
          <div>
            <h2 className="mb-2 text-center text-lg font-semibold text-white">
              Upload your photo or screenshot
            </h2>
            <p className="mb-6 text-center text-sm text-gray-500">
              JPEG, PNG, or WebP. Max 8 MB.
            </p>

            {!previewUrl ? (
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/10 bg-white/[0.02] p-12 transition-colors hover:border-purple-500/30 hover:bg-white/[0.04]"
              >
                <svg className="mb-4 h-10 w-10 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
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
                <div className="overflow-hidden rounded-2xl border border-white/5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="max-h-[400px] w-full object-contain"
                  />
                </div>
                {imageDims && (
                  <p className="mt-2 text-center text-xs text-gray-500">
                    {imageDims.width} &times; {imageDims.height} px
                  </p>
                )}
                <div className="mt-4 flex justify-center gap-3">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Replace
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleRemoveImage}>
                    Remove
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileSelect(f); }}
                  />
                </div>
              </div>
            )}

            {imageError && (
              <p className="mt-3 text-center text-sm text-red-400">{imageError}</p>
            )}

            <div className="mt-6 rounded-xl border border-purple-500/10 bg-purple-500/5 p-4 text-center text-xs text-gray-400">
              Local-only MVP: your image is processed and stored in this browser.
              It is not uploaded to a server.
            </div>
          </div>
        )}

        {/* Step 5: Review & Consent */}
        {step === 5 && (
          <div>
            <h2 className="mb-6 text-center text-lg font-semibold text-white">
              Review your audit
            </h2>
            <Card className="mb-6 space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Audit Type</span>
                <span className="text-white">{AUDIT_TYPES.find((t) => t.id === auditType)?.label}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Goal</span>
                <span className="text-white capitalize">{GOALS.find((g) => g.id === goal)?.label}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Budget</span>
                <span className="text-amber-400">{BUDGETS.find((b) => b.id === budget)?.label}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Personalization</span>
                <span className="text-white">{personalizationSkipped ? "Skipped" : "Completed"}</span>
              </div>
              {file && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Image</span>
                  <span className="text-white truncate max-w-[200px]">{file.name}</span>
                </div>
              )}
            </Card>

            {previewUrl && (
              <Card className="mb-6">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-h-[200px] w-full rounded-xl object-contain"
                />
              </Card>
            )}

            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-4">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-white/10 bg-white/5 text-purple-600 focus:ring-purple-500/50"
              />
              <span className="text-xs leading-relaxed text-gray-400">
                I confirm I own this image or have permission to analyze it. I
                understand AuraCheck analyzes presentation only and does not
                measure human worth.
              </span>
            </label>

            {errors.length > 0 && (
              <div className="mt-4 space-y-1">
                {errors.map((e) => (
                  <p key={e} className="text-sm text-red-400">{e}</p>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="mt-8 flex items-center justify-between">
          <div>
            {step > 0 && (
              <Button variant="ghost" onClick={() => setStep((s) => s - 1)}>
                Back
              </Button>
            )}
          </div>
          <Button
            onClick={goNext}
            disabled={!canNext() || submitting}
          >
            {submitting
              ? "Processing..."
              : step === STEPS.length - 1
                ? "Create Aura Check"
                : "Next"}
          </Button>
        </div>
      </div>
    </Container>
  );
}
