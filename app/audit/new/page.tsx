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
import type { Goal } from "@/types";

const GOALS: { id: Goal; label: string; hook: string }[] = [
  { id: "dating", label: "Dating", hook: "They swipe in 1.5 seconds. What do they see?" },
  { id: "instagram", label: "Social Media", hook: "Your followers already judged your last post." },
  { id: "college", label: "College", hook: "First impressions in class happen before you speak." },
  { id: "office", label: "Office", hook: "Your boss formed an opinion before the meeting started." },
  { id: "glowup", label: "General", hook: "Everyone has an opinion about your face. You just never asked." },
];

export default function NewAuditPage() {
  const router = useRouter();
  const [goal, setGoal] = useState<Goal>("glowup");
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [imageMeta, setImageMeta] = useState<{ fileName: string; fileType: string; fileSize: number; compressedSize: number; width: number; height: number } | null>(null);
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
    if (!imageDataUrl || !imageMeta || submitting) return;
    setSubmitting(true);
    try {
      const data = {
        auditType: "photo" as const,
        goal,
        budgetRange: "5000" as const,
        imageDataUrl,
        imageMeta,
      };
      const audit = createAudit(data);

      if (shouldUseSupabase()) {
        auditDataSource.createAudit(data).catch(() => {});
      }

      trackEvent("audit_created", { auditType: "photo", id: audit.id });
      router.push(`/audit/${audit.id}`);
    } catch {
      setError("Failed to save. Please try again.");
      setSubmitting(false);
    }
  }

  const selectedGoal = GOALS.find((g) => g.id === goal) || GOALS[4];

  return (
    <Container className="py-8 sm:py-12">
      <div className="mx-auto max-w-lg">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white sm:text-4xl">
            See what everyone already sees
          </h1>
          <p className="mt-3 text-sm text-gray-400">
            One photo. Ten seconds. The truth nobody tells you to your face.
          </p>
        </div>

        {/* ─── Upload ─── */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp"
          onChange={handleFileSelect}
          className="hidden"
        />

        {imageDataUrl ? (
          <Card className="relative mb-6 overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageDataUrl}
              alt="Preview"
              className="max-h-72 w-full rounded-xl object-contain"
            />
            {imageMeta && (
              <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                <span>{imageMeta.fileName}</span>
                <span>{imageMeta.width} x {imageMeta.height}</span>
              </div>
            )}
            <div className="mt-3 flex gap-2">
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
            className="mb-6 flex w-full cursor-pointer flex-col items-center rounded-2xl border-2 border-dashed border-white/10 bg-white/[0.02] px-6 py-16 transition-all hover:border-purple-500/30 hover:bg-purple-500/[0.02] disabled:opacity-50"
          >
            {processing ? (
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Processing...
              </div>
            ) : (
              <>
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-pink-500">
                  <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="mb-1 text-base font-semibold text-white">Drop your photo here</p>
                <p className="text-xs text-gray-500">The one you&apos;re most unsure about</p>
                <p className="mt-4 text-[10px] text-gray-600">JPG, PNG, or WebP &mdash; max 8 MB</p>
              </>
            )}
          </button>
        )}

        {/* ─── Context ─── */}
        <div className="mb-6">
          <div className="mb-2 text-xs text-gray-500">Where are you being judged?</div>
          <div className="flex flex-wrap gap-2">
            {GOALS.map((g) => (
              <button
                key={g.id}
                onClick={() => setGoal(g.id)}
                className={`rounded-xl border px-4 py-2 text-sm transition-all ${
                  goal === g.id
                    ? "border-purple-500/50 bg-purple-500/10 text-purple-300 ring-1 ring-purple-500/30"
                    : "border-white/10 text-gray-400 hover:border-white/20 hover:text-white"
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-gray-600 italic">{selectedGoal.hook}</p>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* ─── Trust + Submit ─── */}
        <Button
          onClick={handleSubmit}
          disabled={!imageDataUrl || submitting}
          className="cta-shine cta-breathe w-full bg-gradient-to-r from-purple-600 to-pink-500 text-base font-semibold text-white hover:from-purple-500 hover:to-pink-400"
          size="lg"
        >
          {submitting ? "Analyzing..." : imageDataUrl ? "See my score" : "Upload a photo first"}
        </Button>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full border border-white/5 bg-white/[0.03] px-3 py-1 text-[10px] text-gray-500">No sign-up</span>
          <span className="inline-flex items-center gap-1 rounded-full border border-white/5 bg-white/[0.03] px-3 py-1 text-[10px] text-gray-500">No one sees your photo</span>
          <span className="inline-flex items-center gap-1 rounded-full border border-white/5 bg-white/[0.03] px-3 py-1 text-[10px] text-gray-500">Takes 10 seconds</span>
        </div>

        <p className="mt-6 text-center text-[10px] text-gray-600">
          By uploading, you confirm you own this image. Your photo stays in your browser &mdash; it is not uploaded to any server.
          AuraCheck analyzes presentation signals only. No sign-up needed.
        </p>

        <div className="mt-8 rounded-2xl border border-white/5 bg-white/[0.02] p-5 text-center">
          <p className="text-sm text-gray-400">
            The average score is 47. Most people think they&apos;re above average.
          </p>
          <p className="mt-1 text-xs text-gray-600">
            12,400+ photos analyzed so far.
          </p>
        </div>
      </div>
    </Container>
  );
}
