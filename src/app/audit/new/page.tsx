"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { GlowOrb } from "@/components/ui/GlowOrb";
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
import { detectUnsafePromptText, getSafetyWarningForAudit } from "@/lib/safety/contentSafety";

const AUDIT_TYPES: { id: AuditType; label: string; icon: string }[] = [
  { id: "photo", label: "Photo", icon: "camera" },
  { id: "instagram", label: "Instagram", icon: "instagram" },
  { id: "dating", label: "Dating", icon: "heart" },
  { id: "outfit", label: "Outfit", icon: "tag" },
  { id: "room", label: "Room", icon: "home" },
];

const GOALS: { id: AuditGoal; label: string }[] = [
  { id: "dating", label: "Dating" },
  { id: "instagram", label: "Instagram" },
  { id: "college", label: "College" },
  { id: "office", label: "Office" },
  { id: "glowup", label: "Glow-Up" },
];

const BUDGETS: { id: BudgetAmount; label: string }[] = [
  { id: 0, label: "Free" },
  { id: 2000, label: "2k" },
  { id: 5000, label: "5k" },
  { id: 10000, label: "10k" },
  { id: 25000, label: "25k+" },
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

const SIGNAL_OPTIONS: { id: CurrentSignalItem; label: string }[] = [
  { id: "phone_visible", label: "Phone" },
  { id: "watch_visible", label: "Watch" },
  { id: "shoes_visible", label: "Shoes" },
  { id: "branded_item_visible", label: "Branded" },
  { id: "bike_car_visible", label: "Vehicle" },
  { id: "gym_body_signal", label: "Gym" },
  { id: "travel_signal", label: "Travel" },
  { id: "cafe_signal", label: "Cafe" },
  { id: "room_signal", label: "Room" },
  { id: "none", label: "None" },
];

const CONCERN_OPTIONS: { id: BiggestConcern; label: string }[] = [
  { id: "looking_average", label: "Look average" },
  { id: "weak_photos", label: "Weak photos" },
  { id: "low_matches", label: "Low matches" },
  { id: "poor_instagram", label: "Poor IG" },
  { id: "outfit_confusion", label: "Outfit confusion" },
  { id: "looking_tryhard", label: "Try-hard" },
  { id: "background_issue", label: "Weak bg" },
  { id: "grooming_issue", label: "Grooming" },
  { id: "not_sure", label: "Not sure" },
];

const OCCASION_OPTIONS: { id: OccasionContext; label: string }[] = [
  { id: "dating_profile", label: "Dating" },
  { id: "instagram_post", label: "IG Post" },
  { id: "college_daily", label: "College" },
  { id: "office_profile", label: "Office" },
  { id: "party_event", label: "Party" },
  { id: "family_function", label: "Family" },
  { id: "creator_content", label: "Creator" },
  { id: "general_profile", label: "General" },
];

const SPEND_OPTIONS: { id: SpendComfort; label: string }[] = [
  { id: "no_spend", label: "No spend" },
  { id: "under_2000", label: "< 2k" },
  { id: "under_5000", label: "< 5k" },
  { id: "under_10000", label: "< 10k" },
  { id: "flexible", label: "Flexible" },
];

const CONFIDENCE_OPTIONS: { id: SelfRatedConfidence; label: string }[] = [
  { id: "low", label: "Low" },
  { id: "medium", label: "Medium" },
  { id: "high", label: "High" },
];

function PillButton({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-lg border px-2.5 py-1 text-xs transition-colors ${
        selected
          ? "border-purple-500/50 bg-purple-500/20 text-purple-300"
          : "border-white/10 text-gray-500 hover:border-white/20 hover:text-gray-300"
      }`}
    >
      {children}
    </button>
  );
}

export default function NewAuditPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const [auditType, setAuditType] = useState<AuditType>("photo");
  const [goal, setGoal] = useState<AuditGoal>("glowup");
  const [budget, setBudget] = useState<BudgetAmount>(5000);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageDims, setImageDims] = useState<{ width: number; height: number } | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [consent, setConsent] = useState(false);
  const [showPersonalization, setShowPersonalization] = useState(false);

  const [styleIntent, setStyleIntent] = useState<StyleIntent | null>(null);
  const [currentSignals, setCurrentSignals] = useState<CurrentSignalItem[]>([]);
  const [biggestConcern, setBiggestConcern] = useState<BiggestConcern | null>(null);
  const [occasionContext, setOccasionContext] = useState<OccasionContext | null>(null);
  const [spendComfort, setSpendComfort] = useState<SpendComfort | null>(null);
  const [selfRatedConfidence, setSelfRatedConfidence] = useState<SelfRatedConfidence | null>(null);
  const [wantsBrutalFeedback, setWantsBrutalFeedback] = useState(false);
  const [notes, setNotes] = useState("");
  const [safetyError, setSafetyError] = useState<string | null>(null);
  const [profileBio, setProfileBio] = useState("");
  const [prompts, setPrompts] = useState<{ prompt: string; answer: string }[]>([]);
  const [captionsText, setCaptionsText] = useState("");

  const canSubmit = file !== null && !imageError && consent && !safetyError;

  function buildDeepInput(): DeepAuditInput | undefined {
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
    if (!file || !consent) return;
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
      const profileTexts = profileBio.trim()
        ? {
            bio: profileBio.trim() || undefined,
            prompts: prompts.length > 0 ? prompts.filter((p) => p.answer.trim()) : undefined,
            captions: captionsText.trim() || undefined,
          }
        : undefined;
      updateAudit(audit.id, {
        imageDataUrl: compressed.dataUrl,
        imageMeta,
        deepInput,
        profileTexts,
      });

      router.push(`/audit/${audit.id}`);
    } catch {
      setErrors(["Something went wrong. Please try again."]);
      setSubmitting(false);
    }
  }

  return (
    <>
      <div className="aurora-mesh" />
      <Container className="relative py-8">
        <GlowOrb color="rgba(147, 51, 234, 0.1)" size={300} className="top-[10%] right-[10%]" delay={0} />
        <GlowOrb color="rgba(236, 72, 153, 0.07)" size={220} className="bottom-[15%] left-[5%]" delay={300} />

        <div className="mx-auto max-w-xl">
          {/* Hero: Upload Zone */}
          <div className="mb-6 text-center">
            <h1 className="bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-3xl font-bold text-transparent sm:text-4xl">
              Drop your photo
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Get your aura score in seconds. No account needed.
            </p>
          </div>

          {/* Upload Zone — hero of the page */}
          {!previewUrl ? (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="group mb-6 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/10 bg-white/[0.02] p-12 transition-all hover:border-purple-500/30 hover:bg-white/[0.04]"
            >
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 transition-colors group-hover:bg-purple-500/10">
                <svg className="h-7 w-7 text-gray-500 group-hover:text-purple-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-sm text-gray-400">
                Drag & drop or <span className="text-purple-400">browse</span>
              </p>
              <p className="mt-1 text-xs text-gray-600">JPEG, PNG, or WebP. Max 8 MB.</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileSelect(f); }}
              />
            </div>
          ) : (
            /* Image preview */
            <div className="relative mb-6">
              <div className="overflow-hidden rounded-2xl border border-white/[0.04]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-h-[320px] w-full object-contain"
                />
              </div>
              {imageDims && (
                <p className="mt-2 text-center text-xs text-gray-600">
                  {imageDims.width} &times; {imageDims.height} px
                </p>
              )}
              <div className="mt-3 flex justify-center gap-3">
                <Button variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()}>
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
            <p className="mb-4 text-center text-sm text-red-400">{imageError}</p>
          )}

          {/* Compact config row — audit type + goal + budget */}
          <Card className="mb-4 p-4">
            <div className="grid gap-3 sm:grid-cols-3">
              {/* Audit type */}
              <div>
                <label className="mb-1.5 block text-xs text-gray-500">Type</label>
                <div className="flex flex-wrap gap-1.5">
                  {AUDIT_TYPES.map((t) => (
                    <PillButton key={t.id} selected={auditType === t.id} onClick={() => setAuditType(t.id)}>
                      {t.label}
                    </PillButton>
                  ))}
                </div>
              </div>
              {/* Goal */}
              <div>
                <label className="mb-1.5 block text-xs text-gray-500">Goal</label>
                <div className="flex flex-wrap gap-1.5">
                  {GOALS.map((g) => (
                    <PillButton key={g.id} selected={goal === g.id} onClick={() => setGoal(g.id)}>
                      {g.label}
                    </PillButton>
                  ))}
                </div>
              </div>
              {/* Budget */}
              <div>
                <label className="mb-1.5 block text-xs text-gray-500">Budget</label>
                <div className="flex flex-wrap gap-1.5">
                  {BUDGETS.map((b) => (
                    <PillButton key={b.id} selected={budget === b.id} onClick={() => setBudget(b.id)}>
                      {b.label}
                    </PillButton>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Safety warning */}
          {auditType && (
            <div className="mb-4 rounded-xl border border-amber-500/10 bg-amber-500/5 p-3 text-xs text-amber-300">
              {getSafetyWarningForAudit(auditType)}
            </div>
          )}

          {/* Profile text inputs (for dating/instagram) */}
          {(auditType === "dating" || goal === "dating" || auditType === "instagram" || goal === "instagram") && (
            <Card className="mb-4 p-4">
              <h3 className="mb-3 text-sm font-semibold text-white">Profile Text</h3>
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-xs text-gray-500">Bio / About You</label>
                  <textarea
                    value={profileBio}
                    onChange={(e) => setProfileBio(e.target.value)}
                    placeholder="Paste your bio here..."
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-purple-500/50 focus:outline-none"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-gray-500">Prompts & Answers <span className="text-gray-600">(format: Prompt: Answer)</span></label>
                  <textarea
                    value={prompts.map((p) => `${p.prompt}: ${p.answer}`).join("\n")}
                    onChange={(e) => {
                      const lines = e.target.value.split("\n").filter(Boolean);
                      const parsed = lines.map((line) => {
                        const sep = line.indexOf(":");
                        if (sep > 0) return { prompt: line.slice(0, sep).trim(), answer: line.slice(sep + 1).trim() };
                        return { prompt: "General", answer: line.trim() };
                      });
                      setPrompts(parsed);
                    }}
                    placeholder="My simple pleasure: A quiet morning coffee"
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-purple-500/50 focus:outline-none"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-gray-500">Captions <span className="text-gray-600">(optional)</span></label>
                  <textarea
                    value={captionsText}
                    onChange={(e) => setCaptionsText(e.target.value)}
                    placeholder="Any other profile text..."
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-purple-500/50 focus:outline-none"
                    rows={2}
                  />
                </div>
              </div>
            </Card>
          )}

          {/* Optional Personalization — collapsible */}
          <div className="mb-4">
            <button
              onClick={() => setShowPersonalization(!showPersonalization)}
              className="flex w-full items-center justify-between rounded-xl border border-white/[0.04] bg-white/[0.02] px-4 py-3 text-xs text-gray-500 hover:text-gray-300 transition-colors"
            >
              <span>Optional: Personalize your results</span>
              <svg
                className={`h-4 w-4 transition-transform ${showPersonalization ? "rotate-180" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showPersonalization && (
              <div className="mt-3 space-y-4 animate-slide-in">
                {/* Style Intent */}
                <Card className="p-4">
                  <h3 className="mb-3 text-sm font-semibold text-white">What do you want to look like?</h3>
                  <div className="flex flex-wrap gap-2">
                    {STYLE_OPTIONS.map((s) => (
                      <PillButton key={s.id} selected={styleIntent === s.id} onClick={() => setStyleIntent(s.id)}>
                        {s.label}
                      </PillButton>
                    ))}
                  </div>
                </Card>

                {/* Current Signals */}
                <Card className="p-4">
                  <h3 className="mb-3 text-sm font-semibold text-white">Visible signals in your look?</h3>
                  <div className="flex flex-wrap gap-2">
                    {SIGNAL_OPTIONS.map((s) => (
                      <PillButton key={s.id} selected={currentSignals.includes(s.id)} onClick={() => toggleSignal(s.id)}>
                        {s.label}
                      </PillButton>
                    ))}
                  </div>
                </Card>

                {/* Biggest Concern */}
                <Card className="p-4">
                  <h3 className="mb-3 text-sm font-semibold text-white">Biggest concern?</h3>
                  <div className="flex flex-wrap gap-2">
                    {CONCERN_OPTIONS.map((c) => (
                      <PillButton key={c.id} selected={biggestConcern === c.id} onClick={() => setBiggestConcern(c.id)}>
                        {c.label}
                      </PillButton>
                    ))}
                  </div>
                </Card>

                {/* Occasion */}
                <Card className="p-4">
                  <h3 className="mb-3 text-sm font-semibold text-white">Where will this be used?</h3>
                  <div className="flex flex-wrap gap-2">
                    {OCCASION_OPTIONS.map((o) => (
                      <PillButton key={o.id} selected={occasionContext === o.id} onClick={() => setOccasionContext(o.id)}>
                        {o.label}
                      </PillButton>
                    ))}
                  </div>
                </Card>

                {/* Spend + Confidence row */}
                <div className="grid gap-3 sm:grid-cols-2">
                  <Card className="p-4">
                    <h3 className="mb-3 text-sm font-semibold text-white">Spending comfort</h3>
                    <div className="flex flex-wrap gap-2">
                      {SPEND_OPTIONS.map((s) => (
                        <PillButton key={s.id} selected={spendComfort === s.id} onClick={() => setSpendComfort(s.id)}>
                          {s.label}
                        </PillButton>
                      ))}
                    </div>
                  </Card>
                  <Card className="p-4">
                    <h3 className="mb-3 text-sm font-semibold text-white">Confidence</h3>
                    <div className="flex flex-wrap gap-2">
                      {CONFIDENCE_OPTIONS.map((c) => (
                        <PillButton key={c.id} selected={selfRatedConfidence === c.id} onClick={() => setSelfRatedConfidence(c.id)}>
                          {c.label}
                        </PillButton>
                      ))}
                    </div>
                  </Card>
                </div>

                {/* Brutal feedback + Notes */}
                <Card className="p-4">
                  <label className="flex cursor-pointer items-center gap-3 mb-3">
                    <input
                      type="checkbox"
                      checked={wantsBrutalFeedback}
                      onChange={(e) => setWantsBrutalFeedback(e.target.checked)}
                      className="h-4 w-4 rounded border-white/20 bg-white/5 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-300">Direct/brutal feedback</span>
                  </label>
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

                <div className="rounded-xl border border-purple-500/10 bg-purple-500/5 p-3 text-center text-xs text-gray-500">
                  We do not ask for caste, religion, ethnicity, sexuality, health, or exact income.
                </div>
              </div>
            )}
          </div>

          {/* Consent */}
          <div className="mb-4 space-y-2">
            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/[0.04] bg-white/[0.02] p-3">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-white/10 bg-white/5 text-purple-600 focus:ring-purple-500/50"
              />
              <span className="text-xs leading-relaxed text-gray-400">
                I own this image or have permission to analyze it. I am using AuraCheck for self-improvement. Scores are guidance, not objective truth.
              </span>
            </label>
          </div>

          {/* Local storage notice */}
          <div className="mb-6 rounded-xl border border-purple-500/10 bg-purple-500/5 p-3 text-center text-xs text-gray-500">
            Your image stays in this browser. Not uploaded anywhere.
          </div>

          {/* Submit */}
          {errors.length > 0 && (
            <div className="mb-4 space-y-1">
              {errors.map((e) => (
                <p key={e} className="text-sm text-red-400">{e}</p>
              ))}
            </div>
          )}

          <Button
            onClick={handleSubmit}
            disabled={!canSubmit || submitting}
            className="w-full"
            size="lg"
          >
            {submitting ? "Analyzing..." : "Analyze my photo"}
          </Button>
        </div>
      </Container>
    </>
  );
}
