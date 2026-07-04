"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { createAudit } from "@/lib/storage/auditStore";
import { validateImage, processImage } from "@/lib/image/processImage";
import { shouldUseSupabase } from "@/lib/storage/storageMode";
import { auditDataSource } from "@/lib/storage/auditDataSource";
import { trackEvent } from "@/lib/storage/analyticsStore";
import { getGalleryEntries } from "@/lib/storage/galleryStore";
import { getHomepageProofEntries } from "@/data/homepageProof";
import type { AuditType, Goal } from "@/types";

const DISCOVERY_CARDS = [
  { score: 64, verdict: "Your outfit is doing the work, your lighting is undoing it.", leak: "Harsh overhead shadow on face", gain: 18, initials: "RK", city: "Mumbai", gradient: "from-amber-600 to-orange-500" },
  { score: 71, verdict: "Strong eye contact. Background is distracting.", leak: "Messy room eats 11 points", gain: 11, initials: "AS", city: "Delhi", gradient: "from-sky-600 to-blue-500" },
  { score: 52, verdict: "Good light, terrible crop. Fix the framing.", leak: "Crop cuts at mid-thigh", gain: 22, initials: "VP", city: "Bangalore", gradient: "from-purple-600 to-pink-500" },
  { score: 83, verdict: "Clean signal. One small thing holding it back.", leak: "Logo t-shirt reads as low effort", gain: 8, initials: "NK", city: "Hyderabad", gradient: "from-emerald-600 to-teal-500" },
];

const TEASER_LEAKS = [
  "That background clutter is silently costing you 14 points",
  "Your lighting is adding 3 years to your face right now",
  "That logo tee is why they swiped left — you'll never know",
  "Your photo is cropped at the exact spot that reads 'awkward'",
  "Something in your photo is making people scroll past in 0.2s",
];

const STICKY_TEXTS = [
  "Something's off. Find out what.",
  "They won't tell you. We will.",
  "12,400 found out this week",
];

export default function TryPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [imageMeta, setImageMeta] = useState<{
    fileName: string;
    fileType: string;
    fileSize: number;
    compressedSize: number;
    width: number;
    height: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [galleryEntries, setGalleryEntries] = useState(DISCOVERY_CARDS);
  const [teaserIndex, setTeaserIndex] = useState(0);
  const [teaserVisible, setTeaserVisible] = useState(true);
  const [stickyTextIndex, setStickyTextIndex] = useState(0);

  useEffect(() => {
    const realEntries = getGalleryEntries("recent", 4);
    if (realEntries.length >= 3) {
      setGalleryEntries(
        realEntries.map((e) => ({
          score: e.score,
          verdict: e.oneLineVerdict,
          leak: e.biggestLeak,
          gain: 14,
          initials: e.nickname.slice(0, 2).toUpperCase(),
          city: e.city || "India",
          gradient: e.score >= 75 ? "from-purple-600 to-pink-500" : "from-amber-600 to-orange-500",
        }))
      );
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTeaserVisible(false);
      setTimeout(() => {
        setTeaserIndex((prev) => (prev + 1) % TEASER_LEAKS.length);
        setTeaserVisible(true);
      }, 300);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setStickyTextIndex((prev) => (prev + 1) % STICKY_TEXTS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

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
        handleSubmit(result.dataUrl, result.meta);
      })
      .catch((err) => {
        setError(err.message || "Image processing failed");
        setProcessing(false);
      });
  }

  function handleSubmit(dataUrl: string, meta: typeof imageMeta) {
    if (!meta) return;
    setSubmitting(true);
    try {
      const auditType: AuditType = "photo";
      const goal: Goal = "glowup";
      const budgetRange = "0" as const;

      const audit = createAudit({
        auditType,
        goal,
        budgetRange,
        imageDataUrl: dataUrl,
        imageMeta: meta,
      });
      if (shouldUseSupabase()) {
        auditDataSource.createAudit({ auditType, goal, budgetRange, imageDataUrl: dataUrl, imageMeta: meta }).catch(() => {});
      }
      trackEvent("audit_created", { auditType, id: audit.id, source: "try_page" });
      router.push(`/audit/${audit.id}`);
    } catch {
      setError("Something went wrong. Try again.");
      setSubmitting(false);
    }
  }

  return (
    <>
      <Container className="relative py-8 sm:py-16">
        <div className="mx-auto max-w-xl text-center">
          {/* ─── Badge ─── */}
          <Badge variant="premium" className="mb-5">
            12,400+ vibe checks this week
          </Badge>

          {/* ─── Hero Headline ─── */}
          <h1 className="display-font text-4xl font-bold leading-[1.05] text-white sm:text-5xl sm:leading-[1.05]">
            Your photo is already being judged.
            <br />
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              You just weren&apos;t asked.
            </span>
          </h1>
          <p className="mt-4 text-base leading-7 text-white/60 sm:text-lg">
            Recruiters, dates, strangers — they all decided something about you in 0.3 seconds. What did they decide?
          </p>

          {/* ─── Curiosity Teaser ─── */}
          <div className="mt-6 flex justify-center">
            <div
              className={`inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-sm text-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.08)] transition-all duration-300 ${
                teaserVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"
              }`}
            >
              <span className="text-amber-400">⚠️</span>
              {TEASER_LEAKS[teaserIndex]}
            </div>
          </div>

          {/* ─── Upload CTA ─── */}
          <div className="mt-8">
            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.webp"
              onChange={handleFileSelect}
              className="hidden"
            />
            {processing || submitting ? (
              <div className="flex flex-col items-center gap-3 py-6">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-purple-400 border-t-transparent" />
                <p className="text-sm text-gray-400">
                  {processing ? "Processing your photo..." : "Creating your report..."}
                </p>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-500 px-8 py-4 text-lg font-semibold text-white shadow-[0_0_40px_rgba(147,51,234,0.25)] transition-all hover:from-purple-500 hover:to-pink-400 hover:shadow-[0_0_60px_rgba(147,51,234,0.35)] active:scale-[0.98]"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Drop your photo — 8 seconds
              </button>
            )}
            {error && (
              <p className="mt-3 text-sm text-red-400">{error}</p>
            )}
            <p className="mt-3 text-xs text-gray-500">
              No sign-up. No download. Your photo never leaves your phone.
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full border border-sky-500/20 bg-sky-500/5 px-2.5 py-1 text-[10px] text-sky-300">
                🔒 Local only
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-sky-500/20 bg-sky-500/5 px-2.5 py-1 text-[10px] text-sky-300">
                📵 No sign-up
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-sky-500/20 bg-sky-500/5 px-2.5 py-1 text-[10px] text-sky-300">
                ⚡ 8 seconds
              </span>
            </div>
          </div>
        </div>

        {/* ─── What You'll See ─── */}
        <div className="mx-auto mt-20 max-w-lg">
          <div className="mb-6 text-center">
            <h2 className="text-xl font-bold text-white">Your photo is already talking about you. Here&apos;s what it&apos;s saying.</h2>
          <p className="mt-2 text-xs text-white/45">Your friends won&apos;t tell you. Your mom thinks you look great. Strangers just scroll past. In 8 seconds, you&apos;ll finally know why:</p>
          </div>
          <div className="space-y-3">
            {[
              { emoji: "🎯", text: "Your real score out of 100 — not what your friends say" },
              { emoji: "🔍", text: "The #1 thing people notice about you (that you can't see)" },
              { emoji: "⚡", text: "The one fix that would change everything — under Rs 500" },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.03] px-5 py-4"
              >
                <span className="text-xl">{item.emoji}</span>
                <span className="text-sm font-medium text-white">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ─── What People Found ─── */}
        <div className="mx-auto mt-20 max-w-3xl">
          <div className="mb-6 text-center">
            <h2 className="text-xl font-bold text-white">Nobody warned them either. They found out the hard way.</h2>
          <p className="mt-2 text-xs text-white/45">Every person below was confident about their photo. Then they uploaded it. Here&apos;s what 12,400 people discovered this week:</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {galleryEntries.map((card, i) => (
              <div
                key={i}
                className="rounded-2xl border border-white/10 bg-[#0f0f17] p-4 transition-all hover:border-purple-500/20 hover:shadow-[0_0_25px_rgba(147,51,234,0.08)]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br ${card.gradient} text-[11px] font-bold text-white`}
                    >
                      {card.initials}
                    </div>
                    <div>
                      <div className="text-xs font-medium text-white">{card.city}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white">{card.score}</div>
                    <div className="text-[10px] text-gray-500">/100</div>
                  </div>
                </div>

                <p className="mt-3 text-sm leading-relaxed text-gray-300 italic">
                  &ldquo;{card.verdict}&rdquo;
                </p>

                <div className="mt-3 space-y-2">
                  <div className="flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2">
                    <span className="text-[10px] text-red-400">#1 leak</span>
                    <span className="text-xs text-red-300">{card.leak}</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-3 py-2">
                    <span className="text-[10px] text-emerald-400">Fixed</span>
                    <span className="text-xs font-semibold text-emerald-300">
                      +{card.gain} pts
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ─── Before / After Proof Cards ─── */}
        <div className="mx-auto mt-20 max-w-3xl">
          <div className="mb-6 text-center">
            <h2 className="text-xl font-bold text-white">It was one thing. Just one. And nobody had the guts to tell them.</h2>
          <p className="mt-2 text-xs text-white/45">These people had been walking around with the same leak for months. One fix. That&apos;s all it took to change how everyone saw them:</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {getHomepageProofEntries().slice(0, 3).map((entry) => (
              <div
                key={entry.initials}
                className="rounded-2xl border border-white/10 bg-[#0f0f17] p-4 transition-all hover:border-emerald-500/20"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br ${entry.gradient} text-[10px] font-bold text-white`}
                    >
                      {entry.initials}
                    </div>
                    <span className="text-[10px] text-gray-500">{entry.city}</span>
                  </div>
                  <span className="text-[10px] text-gray-600">{entry.timeframe}</span>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-sm font-bold text-white/40">{entry.beforeScore}</span>
                  <svg
                    className="h-3.5 w-3.5 text-emerald-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                  <span className="text-sm font-bold text-white">{entry.afterScore}</span>
                </div>
                <p className="mt-2 text-xs text-gray-400">&ldquo;{entry.leakLabel}&rdquo;</p>
                <span className="mt-1 inline-block text-[10px] font-semibold text-emerald-400">
                  +{entry.pointsGained} pts
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ─── Quick Fixes You Can Buy Right Now ─── */}
        <div className="mx-auto mt-20 max-w-3xl">
          <div className="mb-6 text-center">
            <h2 className="text-xl font-bold text-white">The thing ruining your look costs less than your lunch to fix.</h2>
            <p className="mt-2 text-xs text-white/45">This is what people panic-buy the moment they see their score. The average leak costs Rs 399 to patch. You just don&apos;t know which one is yours yet:</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { label: "Ring Light", price: "Rs 399", fix: "Fixes flat lighting (+12 pts)", emoji: "💡", url: "https://www.amazon.in/s?k=ring+light+selfie&tag=auracheck-21" },
              { label: "Solid Tee", price: "Rs 349", fix: "Kills logo noise (+8 pts)", emoji: "👕", url: "https://www.amazon.in/s?k=solid+colour+tshirt+men&tag=auracheck-21" },
              { label: "Phone Tripod", price: "Rs 299", fix: "Fixes bad crop (+11 pts)", emoji: "📱", url: "https://www.amazon.in/s?k=phone+tripod+stand&tag=auracheck-21" },
            ].map((p) => (
              <a key={p.label} href={p.url} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3 transition-all hover:border-sky-500/20">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/5 text-2xl">
                  {p.emoji}
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">{p.label} <span className="text-white/40">· {p.price}</span></div>
                  <div className="text-[11px] text-emerald-400">{p.fix}</div>
                  <div className="mt-1 text-[10px] text-sky-300 group-hover:text-sky-200">Buy on Amazon →</div>
                </div>
              </a>
            ))}
          </div>
          <p className="mt-4 text-center">
            <Link href="/shop" className="text-xs text-purple-400 hover:text-purple-300">See all fixes by leak type →</Link>
          </p>
        </div>

        {/* ─── Final CTA ─── */}
        <div className="mx-auto mt-20 max-w-xl text-center">
          <div className="rounded-[36px] border border-purple-500/20 bg-gradient-to-b from-purple-500/5 to-transparent p-8 sm:p-12">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Every day you don&apos;t check is another day of wrong first impressions.
            </h2>
            <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-white/55">
              That date who ghosted. That recruiter who never called back. That group photo where everyone else looked great. What if it was one fixable thing the whole time? One photo. Eight seconds. Stop wondering.
            </p>
            <div className="mt-6">
              <button
                onClick={() => {
                  fileInputRef.current?.click();
                  trackEvent("pricing_cta_clicked", { source: "try_bottom_cta" });
                }}
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-500 px-8 py-4 text-base font-semibold text-white shadow-[0_0_40px_rgba(147,51,234,0.25)] transition-all hover:from-purple-500 hover:to-pink-400"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                Check mine free
              </button>
            </div>
          </div>
          <p className="mt-4 text-xs text-gray-600">
            Presentation guidance only. Does not measure human worth.
          </p>
        </div>
      </Container>

      {/* ─── Sticky Mobile Bottom Bar ─── */}
      <div className="fixed bottom-0 left-0 right-0 z-50 sm:hidden">
        <div className="h-[2px] w-full bg-gradient-to-r from-purple-500 via-pink-500 to-sky-400" />
        <div className="flex items-center justify-between gap-3 bg-[#0a0a0f]/90 px-4 py-3 backdrop-blur-xl">
          <div className="min-w-0 flex-1">
            <div
              className="text-xs font-medium text-white/80 transition-all duration-500"
              key={stickyTextIndex}
            >
              {STICKY_TEXTS[stickyTextIndex]}
            </div>
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="shrink-0 rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_0_25px_rgba(147,51,234,0.3)] active:scale-95"
          >
            Check free
          </button>
        </div>
      </div>
    </>
  );
}
