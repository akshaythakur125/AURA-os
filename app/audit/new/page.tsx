"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { createAudit } from "@/lib/storage/auditStore";
import { validateImage, processImage } from "@/lib/image/processImage";
import { shouldUseSupabase } from "@/lib/storage/storageMode";
import { auditDataSource } from "@/lib/storage/auditDataSource";
import { trackEvent } from "@/lib/storage/analyticsStore";
import type { AuditType, Goal, BudgetRange } from "@/types";
import type { StyleIntent, CurrentSignalItem, BiggestConcern, OccasionContext, SpendComfort, SelfRatedConfidence } from "@/types/personalization";
import { STYLE_INTENT_LABELS, SIGNAL_ITEM_LABELS, CONCERN_LABELS, OCCASION_LABELS, SPEND_LABELS, CONFIDENCE_LABELS } from "@/types/personalization";
import type { PreferredTone, AvoidTone } from "@/types/profileAudit";
import { PREFERRED_TONE_LABELS, AVOID_TONE_LABELS } from "@/types/profileAudit";

const AUDIT_TYPES: { id: AuditType; label: string; desc: string; gradient: string; icon: string }[] = [
  { id: "photo", label: "Photo Aura Check", desc: "Analyze a single photo for expression, lighting, background, and overall visual signal.", gradient: "from-purple-600 to-pink-500", icon: "camera" },
  { id: "instagram", label: "Instagram Profile Audit", desc: "Review your Instagram profile for coherence, signal consistency, and first-impression strength.", gradient: "from-pink-500 to-rose-500", icon: "instagram" },
  { id: "dating", label: "Dating Profile Audit", desc: "Evaluate your dating app profile — photos, bio, prompts, and overall presentation.", gradient: "from-rose-500 to-red-500", icon: "heart" },
  { id: "outfit", label: "Outfit Audit", desc: "Check how your outfit fits, coordinates, and signals across different contexts.", gradient: "from-amber-500 to-orange-500", icon: "shirt" },
  { id: "background", label: "Room / Background Audit", desc: "Assess the environment behind you — clutter, lighting, color, and overall vibe.", gradient: "from-emerald-500 to-teal-500", icon: "home" },
];

const GOALS: { id: Goal; label: string }[] = [
  { id: "dating", label: "Dating" },
  { id: "instagram", label: "Instagram" },
  { id: "college", label: "College" },
  { id: "office", label: "Office" },
  { id: "glowup", label: "General Glow-Up" },
];

const BUDGETS: { id: BudgetRange; label: string }[] = [
  { id: "0", label: "₹0 — Free only" },
  { id: "2000", label: "₹2,000" },
  { id: "5000", label: "₹5,000" },
  { id: "10000", label: "₹10,000" },
  { id: "25000", label: "₹25,000+" },
];

export default function NewAuditPage() {
  const router = useRouter();
  const [auditType, setAuditType] = useState<AuditType | null>(null);
  const [goal, setGoal] = useState<Goal | null>(null);
  const [budgetRange, setBudgetRange] = useState<BudgetRange | null>(null);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [imageMeta, setImageMeta] = useState<{ fileName: string; fileType: string; fileSize: number; compressedSize: number; width: number; height: number } | null>(null);
  const [consent, setConsent] = useState(false);
  const [showPersonalization, setShowPersonalization] = useState(false);
  const [styleIntent, setStyleIntent] = useState<StyleIntent | null>(null);
  const [currentSignals, setCurrentSignals] = useState<CurrentSignalItem[]>([]);
  const [biggestConcern, setBiggestConcern] = useState<BiggestConcern | null>(null);
  const [occasionContext, setOccasionContext] = useState<OccasionContext | null>(null);
  const [spendComfort, setSpendComfort] = useState<SpendComfort | null>(null);
  const [selfRatedConfidence, setSelfRatedConfidence] = useState<SelfRatedConfidence | null>(null);
  const [wantsDirectFeedback, setWantsDirectFeedback] = useState(false);
  const [notes, setNotes] = useState("");
  const [showProfileText, setShowProfileText] = useState(false);
  const [profileBio, setProfileBio] = useState("");
  const [profilePrompt1, setProfilePrompt1] = useState("");
  const [profilePrompt2, setProfilePrompt2] = useState("");
  const [profilePrompt3, setProfilePrompt3] = useState("");
  const [profileCaptions, setProfileCaptions] = useState("");
  const [preferredTone, setPreferredTone] = useState<PreferredTone | null>(null);
  const [avoidTones, setAvoidTones] = useState<AvoidTone[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function toggleAvoidTone(tone: AvoidTone) {
    setAvoidTones((prev) =>
      prev.includes(tone) ? prev.filter((t) => t !== tone) : [...prev, tone]
    );
  }

  function toggleSignal(signal: CurrentSignalItem) {
    setCurrentSignals((prev) =>
      prev.includes(signal) ? prev.filter((s) => s !== signal) : [...prev, signal]
    );
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
      .then((result) => {
        setImageDataUrl(result.dataUrl);
        setImageMeta(result.meta);
        setProcessing(false);
      })
      .catch((err) => {
        setError(err.message || "Image processing failed");
        setProcessing(false);
      });
  }

  function handleRemoveImage() {
    setImageDataUrl(null);
    setImageMeta(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleSubmit() {
    if (!auditType || !goal || !budgetRange || !imageDataUrl || !imageMeta || !consent) return;
    setSubmitting(true);
    try {
      const base = {
        auditType, goal, budgetRange, imageDataUrl, imageMeta,
      } as const;
      const data: Record<string, unknown> = { ...base };
      if (showPersonalization) {
        data.deepInput = {
          styleIntent,
          currentSignals,
          biggestConcern,
          occasionContext,
          spendComfort,
          selfRatedConfidence,
          wantsDirectFeedback,
          notes,
        };
      }
      if (showProfileText && (auditType === "dating" || auditType === "instagram")) {
        const prompts: string[] = [];
        if (profilePrompt1.trim()) prompts.push(profilePrompt1.trim());
        if (profilePrompt2.trim()) prompts.push(profilePrompt2.trim());
        if (profilePrompt3.trim()) prompts.push(profilePrompt3.trim());
        data.profileTextInput = {
          bio: profileBio.trim() || undefined,
          prompts: prompts.length > 0 ? prompts : undefined,
          captions: profileCaptions.trim() ? profileCaptions.trim().split("\n").filter(Boolean) : undefined,
          preferredTone: preferredTone || undefined,
          avoidTone: avoidTones.length > 0 ? avoidTones : undefined,
          notes: notes.trim() || undefined,
        };
      }
      const audit = createAudit(data as Parameters<typeof createAudit>[0]);

      // If Supabase mode, also save to cloud (fire-and-forget)
      if (shouldUseSupabase()) {
        auditDataSource.createAudit(data).catch(() => {
          // Non-blocking; local save already succeeded
        });
      }

      trackEvent("audit_created", { auditType, id: audit.id });
      router.push(`/audit/${audit.id}`);
    } catch {
      setError("Failed to save audit. Please try again.");
      setSubmitting(false);
    }
  }

  function canSubmit(): boolean {
    return !!auditType && !!goal && !!budgetRange && !!imageDataUrl && consent && !submitting;
  }

  return (
    <Container className="py-8 sm:py-12">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-2 text-3xl font-bold text-white">New Aura Check</h1>
        <p className="mb-8 text-sm text-gray-400">
          Select your audit type, goal, and budget. Then upload a photo to begin.
        </p>

        {/* ─── Audit Type ─── */}
        <section className="mb-8">
          <h2 className="mb-3 text-sm font-semibold text-white">1. What do you want to check?</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {AUDIT_TYPES.map((t) => {
              const selected = auditType === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setAuditType(t.id)}
                  className={`relative overflow-hidden rounded-2xl border p-4 text-left transition-all ${
                    selected
                      ? "border-purple-500/50 bg-purple-500/10 ring-1 ring-purple-500/30"
                      : "border-white/5 bg-white/[0.03] hover:border-white/10 hover:bg-white/[0.06]"
                  }`}
                >
                  <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${t.gradient}`}>
                    <span className="text-lg text-white">
                      {t.icon === "camera" && "📷"}
                      {t.icon === "instagram" && "📱"}
                      {t.icon === "heart" && "💜"}
                      {t.icon === "shirt" && "👔"}
                      {t.icon === "home" && "🏠"}
                    </span>
                  </div>
                  <h3 className="mb-1 text-sm font-semibold text-white">{t.label}</h3>
                  <p className="text-xs leading-relaxed text-gray-500">{t.desc}</p>
                </button>
              );
            })}
          </div>
        </section>

        {/* ─── Goal ─── */}
        <section className="mb-8">
          <h2 className="mb-3 text-sm font-semibold text-white">2. What is your goal?</h2>
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
                  {g.label}
                </button>
              );
            })}
          </div>
        </section>

        {/* ─── Budget ─── */}
        <section className="mb-8">
          <h2 className="mb-3 text-sm font-semibold text-white">3. What is your budget?</h2>
          <div className="flex flex-wrap gap-2">
            {BUDGETS.map((b) => {
              const selected = budgetRange === b.id;
              return (
                <button
                  key={b.id}
                  onClick={() => setBudgetRange(b.id)}
                  className={`rounded-xl border px-4 py-2 text-sm transition-all ${
                    selected
                      ? "border-purple-500/50 bg-purple-500/10 text-purple-300 ring-1 ring-purple-500/30"
                      : "border-white/10 text-gray-400 hover:border-white/20 hover:text-white"
                  }`}
                >
                  {b.label}
                </button>
              );
            })}
          </div>
        </section>

        {/* ─── Image Upload ─── */}
        <section className="mb-8">
          <h2 className="mb-3 text-sm font-semibold text-white">4. Upload a photo or screenshot</h2>
          <input
            ref={fileInputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.webp"
            onChange={handleFileSelect}
            className="hidden"
          />

          {imageDataUrl ? (
            <Card className="relative overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageDataUrl}
                alt="Preview"
                className="max-h-80 w-full rounded-xl object-contain"
              />
              {imageMeta && (
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-500 sm:grid-cols-4">
                  <div><span className="text-gray-400">File:</span> {imageMeta.fileName}</div>
                  <div><span className="text-gray-400">Size:</span> {(imageMeta.compressedSize / 1024).toFixed(0)} KB</div>
                  <div><span className="text-gray-400">Dimensions:</span> {imageMeta.width} &times; {imageMeta.height}</div>
                  <div><span className="text-gray-400">Type:</span> {imageMeta.fileType}</div>
                </div>
              )}
              <div className="mt-4 flex gap-3">
                <Button variant="ghost" size="sm" onClick={() => fileInputRef.current?.click()}>
                  Replace
                </Button>
                <Button variant="ghost" size="sm" onClick={handleRemoveImage}>
                  Remove
                </Button>
              </div>
            </Card>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={processing}
              className="flex w-full cursor-pointer flex-col items-center rounded-2xl border-2 border-dashed border-white/10 bg-white/[0.02] px-6 py-12 transition-all hover:border-purple-500/30 hover:bg-purple-500/[0.02] disabled:opacity-50"
            >
              {processing ? (
                <p className="text-sm text-gray-400">Processing image...</p>
              ) : (
                <>
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-pink-500">
                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="mb-1 text-sm font-medium text-gray-300">Click to upload</p>
                  <p className="text-xs text-gray-600">JPG, PNG, or WebP — max 8 MB</p>
                </>
              )}
            </button>
          )}
        </section>

        {/* ─── Personalization ─── */}
        <section className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">5. Personalize your Aura Check (optional)</h2>
            {!showPersonalization ? (
              <Button variant="ghost" size="sm" onClick={() => setShowPersonalization(true)}>+ Add Details</Button>
            ) : (
              <Button variant="ghost" size="sm" onClick={() => setShowPersonalization(false)}>Skip</Button>
            )}
          </div>
          {showPersonalization && (
            <Card>
              <div className="space-y-6">
                <div>
                  <div className="mb-2 text-xs text-gray-500">What do you want to look like?</div>
                  <div className="flex flex-wrap gap-2">
                    {(Object.entries(STYLE_INTENT_LABELS) as [StyleIntent, string][]).map(([key, label]) => (
                      <button
                        key={key}
                        onClick={() => setStyleIntent(key)}
                        className={`rounded-full border px-3 py-1 text-xs transition-all ${
                          styleIntent === key
                            ? "border-purple-500/50 bg-purple-500/10 text-purple-300"
                            : "border-white/10 text-gray-400 hover:border-white/20"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="mb-2 text-xs text-gray-500">What visible signals are part of your look?</div>
                  <div className="flex flex-wrap gap-2">
                    {(Object.entries(SIGNAL_ITEM_LABELS) as [CurrentSignalItem, string][]).map(([key, label]) => (
                      <button
                        key={key}
                        onClick={() => toggleSignal(key)}
                        className={`rounded-full border px-3 py-1 text-xs transition-all ${
                          currentSignals.includes(key)
                            ? "border-purple-500/50 bg-purple-500/10 text-purple-300"
                            : "border-white/10 text-gray-400 hover:border-white/20"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="mb-2 text-xs text-gray-500">What is your biggest concern?</div>
                  <div className="flex flex-wrap gap-2">
                    {(Object.entries(CONCERN_LABELS) as [BiggestConcern, string][]).map(([key, label]) => (
                      <button
                        key={key}
                        onClick={() => setBiggestConcern(key)}
                        className={`rounded-full border px-3 py-1 text-xs transition-all ${
                          biggestConcern === key
                            ? "border-purple-500/50 bg-purple-500/10 text-purple-300"
                            : "border-white/10 text-gray-400 hover:border-white/20"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="mb-2 text-xs text-gray-500">Where will this image be used?</div>
                  <div className="flex flex-wrap gap-2">
                    {(Object.entries(OCCASION_LABELS) as [OccasionContext, string][]).map(([key, label]) => (
                      <button
                        key={key}
                        onClick={() => setOccasionContext(key)}
                        className={`rounded-full border px-3 py-1 text-xs transition-all ${
                          occasionContext === key
                            ? "border-purple-500/50 bg-purple-500/10 text-purple-300"
                            : "border-white/10 text-gray-400 hover:border-white/20"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="mb-2 text-xs text-gray-500">What is your spending comfort?</div>
                  <div className="flex flex-wrap gap-2">
                    {(Object.entries(SPEND_LABELS) as [SpendComfort, string][]).map(([key, label]) => (
                      <button
                        key={key}
                        onClick={() => setSpendComfort(key)}
                        className={`rounded-full border px-3 py-1 text-xs transition-all ${
                          spendComfort === key
                            ? "border-purple-500/50 bg-purple-500/10 text-purple-300"
                            : "border-white/10 text-gray-400 hover:border-white/20"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="mb-2 text-xs text-gray-500">Self-rated confidence</div>
                  <div className="flex flex-wrap gap-2">
                    {(Object.entries(CONFIDENCE_LABELS) as [SelfRatedConfidence, string][]).map(([key, label]) => (
                      <button
                        key={key}
                        onClick={() => setSelfRatedConfidence(key)}
                        className={`rounded-full border px-3 py-1 text-xs transition-all ${
                          selfRatedConfidence === key
                            ? "border-purple-500/50 bg-purple-500/10 text-purple-300"
                            : "border-white/10 text-gray-400 hover:border-white/20"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={wantsDirectFeedback}
                    onChange={(e) => setWantsDirectFeedback(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-white/20 bg-white/5 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-400">I want direct but useful feedback.</span>
                </label>

                <div>
                  <label className="mb-1 block text-xs text-gray-500">Anything specific you want AuraCheck to consider?</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Optional notes..."
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:border-purple-500/50 focus:outline-none"
                    rows={3}
                  />
                </div>

                <div className="rounded-lg bg-purple-500/5 p-3 text-xs text-gray-500">
                  We do not ask for caste, religion, ethnicity, sexuality, health details, or exact income. AuraCheck only uses your selected presentation goals and image-quality signals.
                </div>
              </div>
            </Card>
          )}
        </section>

        {/* ─── Profile Text Input ─── */}
        {(auditType === "dating" || auditType === "instagram") && (
          <section className="mb-8">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white">6. Add profile text for deeper audit (optional)</h2>
              {!showProfileText ? (
                <Button variant="ghost" size="sm" onClick={() => setShowProfileText(true)}>+ Add Text</Button>
              ) : (
                <Button variant="ghost" size="sm" onClick={() => setShowProfileText(false)}>Skip</Button>
              )}
            </div>
            {showProfileText && (
              <Card>
                <div className="space-y-5">
                  <div>
                    <label className="mb-1 block text-xs text-gray-500">Bio / About text</label>
                    <textarea
                      value={profileBio}
                      onChange={(e) => setProfileBio(e.target.value)}
                      placeholder="Your bio or about section..."
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:border-purple-500/50 focus:outline-none"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-gray-500">Prompt 1 (optional)</label>
                    <input
                      type="text"
                      value={profilePrompt1}
                      onChange={(e) => setProfilePrompt1(e.target.value)}
                      placeholder="e.g. My perfect Sunday..."
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:border-purple-500/50 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-gray-500">Prompt 2 (optional)</label>
                    <input
                      type="text"
                      value={profilePrompt2}
                      onChange={(e) => setProfilePrompt2(e.target.value)}
                      placeholder="e.g. Two truths and a lie..."
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:border-purple-500/50 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-gray-500">Prompt 3 (optional)</label>
                    <input
                      type="text"
                      value={profilePrompt3}
                      onChange={(e) => setProfilePrompt3(e.target.value)}
                      placeholder="e.g. I am looking for..."
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:border-purple-500/50 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-gray-500">Caption examples (one per line, optional)</label>
                    <textarea
                      value={profileCaptions}
                      onChange={(e) => setProfileCaptions(e.target.value)}
                      placeholder="caption line 1&#10;caption line 2"
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:border-purple-500/50 focus:outline-none"
                      rows={3}
                    />
                  </div>
                  <div>
                    <div className="mb-2 text-xs text-gray-500">Preferred tone</div>
                    <div className="flex flex-wrap gap-2">
                      {(Object.entries(PREFERRED_TONE_LABELS) as [PreferredTone, string][]).map(([key, label]) => (
                        <button
                          key={key}
                          onClick={() => setPreferredTone(key)}
                          className={`rounded-full border px-3 py-1 text-xs transition-all ${
                            preferredTone === key
                              ? "border-purple-500/50 bg-purple-500/10 text-purple-300"
                              : "border-white/10 text-gray-400 hover:border-white/20"
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="mb-2 text-xs text-gray-500">Things to avoid</div>
                    <div className="flex flex-wrap gap-2">
                      {(Object.entries(AVOID_TONE_LABELS) as [AvoidTone, string][]).map(([key, label]) => (
                        <button
                          key={key}
                          onClick={() => toggleAvoidTone(key)}
                          className={`rounded-full border px-3 py-1 text-xs transition-all ${
                            avoidTones.includes(key)
                              ? "border-red-500/50 bg-red-500/10 text-red-300"
                              : "border-white/10 text-gray-400 hover:border-white/20"
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-lg bg-amber-500/5 p-3 text-xs text-gray-500">
                    Profile guidance is for presentation clarity, not dating guarantees. Do not share personal contact information or financial details.
                  </div>
                </div>
              </Card>
            )}
          </section>
        )}

        {/* ─── Error ─── */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* ─── Consent ─── */}
        <section className="mb-8">
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-white/20 bg-white/5 text-purple-600 focus:ring-purple-500"
            />
            <span className="text-sm leading-relaxed text-gray-400">
              I confirm I own this image or have permission to analyze it. I understand
              AuraCheck analyzes presentation only and does not measure human worth.
            </span>
          </label>
        </section>

        {/* ─── Privacy Note ─── */}
        <div className="mb-8 rounded-xl border border-purple-500/10 bg-purple-500/5 px-4 py-3 text-xs text-gray-500">
          {shouldUseSupabase()
            ? "In cloud mode, reports and image paths are stored in Supabase. Images are stored in a private bucket."
            : "Local-only MVP: your image is processed and stored in this browser. It is not uploaded to a server."}
        </div>

        {/* ─── Trust Chips ─── */}
        <div className="mb-4 flex flex-wrap items-center justify-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full border border-sky-500/20 bg-sky-500/5 px-3 py-1 text-[10px] text-sky-300">🔒 Local only</span>
          <span className="inline-flex items-center gap-1 rounded-full border border-sky-500/20 bg-sky-500/5 px-3 py-1 text-[10px] text-sky-300">📵 No sign-up</span>
          <span className="inline-flex items-center gap-1 rounded-full border border-sky-500/20 bg-sky-500/5 px-3 py-1 text-[10px] text-sky-300">🇮🇳 UPI checkout</span>
        </div>

        {/* ─── Submit ─── */}
        <Button
          onClick={handleSubmit}
          disabled={!canSubmit()}
          className="w-full"
          size="lg"
        >
          {submitting ? "Saving..." : "Start Aura Check"}
        </Button>
        <p className="mt-3 text-center text-[10px] text-gray-600">This MVP stores data locally in your browser. Clearing browser data may delete your reports.</p>
      </div>
    </Container>
  );
}
