"use client";

import { useState } from "react";
import { hasGivenFeedback, saveFeedback } from "@/lib/storage/feedbackStore";
import { pushFeedbackToSupabase } from "@/lib/supabase/syncFeedback";
import { trackEvent } from "@/lib/storage/analyticsStore";

interface Props {
  auditId: string;
  productType?: string;
}

/**
 * Shown to paid users after their report. Captures a genuine star rating +
 * one-liner so the owner can build REAL testimonials over time (no fabricated
 * reviews). Only feedback with explicit "feature" consent should ever be shown
 * publicly, and always anonymously.
 */
export function FeedbackPrompt({ auditId, productType = "aura_report" }: Props) {
  const [alreadyGiven] = useState(() => hasGivenFeedback(auditId));
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [consent, setConsent] = useState(true);
  const [done, setDone] = useState(false);

  if (alreadyGiven || done) {
    return (
      <div className="mb-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5 text-center">
        <p className="text-sm font-medium text-emerald-500">Thanks for the feedback 🙏</p>
        <p className="mt-1 text-xs text-[#857b6e]">It genuinely helps us make AuraCheck better.</p>
      </div>
    );
  }

  function submit() {
    if (rating < 1) return;
    const trimmed = comment.trim().slice(0, 240);
    const record = {
      auditId,
      productType,
      rating,
      comment: trimmed || undefined,
      featureConsent: consent,
      createdAt: new Date().toISOString(),
    };
    saveFeedback(record);
    void pushFeedbackToSupabase(record);
    trackEvent({ eventName: "feedback_submitted", auditId, metadata: { rating: String(rating), consent: String(consent), product: productType } });
    setDone(true);
  }

  const active = hover || rating;

  return (
    <div className="mb-6 rounded-2xl border border-[#1c1917]/[0.08] bg-[#F7F1E6]/70 p-5">
      <p className="text-sm font-semibold text-[#1C1917]">How was your report?</p>
      <p className="mt-0.5 text-xs text-[#857b6e]">Your honest take helps us — and other users — get better results.</p>

      {/* Stars */}
      <div className="mt-3 flex items-center gap-1.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            aria-label={`${n} star${n > 1 ? "s" : ""}`}
            onClick={() => setRating(n)}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            className="p-0.5 transition-transform hover:scale-110"
          >
            <svg
              className={`h-7 w-7 ${n <= active ? "text-amber-400" : "text-[#1c1917]/15"}`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </button>
        ))}
      </div>

      {rating > 0 && (
        <div className="mt-4 space-y-3">
          <input
            type="text"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={240}
            placeholder={rating >= 4 ? "What did you like most? (optional)" : "What would've made it better? (optional)"}
            className="w-full rounded-lg border border-[#1c1917]/10 bg-white/60 px-3 py-2 text-sm text-[#1C1917] placeholder-[#9c9184] focus:border-red-500/50 focus:outline-none"
          />
          <label className="flex cursor-pointer items-start gap-2 text-[11px] text-[#6f675e]">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-0.5 h-3.5 w-3.5 rounded border-[#1c1917]/20 text-red-600 focus:ring-red-500/40"
            />
            <span>OK to feature this anonymously (no name, no photo) to help others decide.</span>
          </label>
          <button
            onClick={submit}
            className="w-full rounded-xl bg-gradient-to-r from-[#E14434] to-[#c0341f] px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-transform hover:scale-[1.01]"
          >
            Send feedback
          </button>
        </div>
      )}
    </div>
  );
}
