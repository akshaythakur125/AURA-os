"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { createAudit } from "@/lib/storage/auditStore";
import { validateImage, processImage } from "@/lib/image/processImage";
import type { AuditType, Goal, BudgetRange } from "@/types";

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
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      const audit = createAudit({
        auditType,
        goal,
        budgetRange,
        imageDataUrl,
        imageMeta,
      });
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
          Local-only MVP: your image is processed and stored in this browser.
          It is not uploaded to a server.
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
      </div>
    </Container>
  );
}
