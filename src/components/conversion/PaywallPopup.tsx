"use client";
import { PAYMENT_PRODUCTS, formatPrice } from "@/config/pricing";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { FadeInView } from "@/components/ui/FadeInView";

interface PaywallPopupProps {
  open: boolean;
  onClose: () => void;
  auditId: string;
  trigger?: string; // what they tried to unlock
  /** The user's measured score, so the modal speaks to their actual result. */
  score?: number | null;
  /** How many fixable issues were found — concrete, personalised urgency. */
  issueCount?: number;
}

const FEATURES = [
  { icon: "📊", text: "Full score breakdown — lighting, grooming, expression, and more" },
  { icon: "🔍", text: "All photo-quality issues with exact fixes" },
  { icon: "✨", text: "Celebrity style match + shop the look" },
  { icon: "🗺️", text: "Personalized improvement roadmap — step by step" },
  { icon: "💰", text: "Budget upgrade plan — what to buy and where" },
  { icon: "📍", text: "Nearby salons, gyms, and studios" },
  { icon: "🎨", text: "Colour palette matched to your look" },
  { icon: "📈", text: "Before vs after improvement preview" },
  { icon: "🎴", text: "Shareable score card — download & share on Instagram" },
  { icon: "🛍️", text: "Personalized product picks — styled for your look & budget" },
];

export function PaywallPopup({ open, onClose, auditId, trigger, score, issueCount }: PaywallPopupProps) {
  if (!open) return null;

  const hasScore = typeof score === "number";
  const issues = issueCount ?? 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Modal */}
      <FadeInView>
        <div
          className="relative w-full max-w-md rounded-3xl border border-[#1c1917]/10 bg-[#F2ECE1] p-6 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close */}
          <button onClick={onClose} className="absolute right-4 top-4 text-[#857b6e] hover:text-[#1C1917] text-lg">
            ✕
          </button>

          {/* Header */}
          <div className="mb-5 text-center">
            <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-amber-500 text-xl">
              🔓
            </div>
            <h2 className="text-xl font-bold text-[#1C1917]">Unlock Your Full Report</h2>
            {trigger && (
              <p className="mt-1 text-xs text-[#857b6e]">{trigger} is inside — plus everything below</p>
            )}
          </div>

          {/* Personalised banner — mirror their actual result, not a generic pitch */}
          {hasScore && (
            <div className="mb-5 rounded-xl border border-[#E14434]/20 bg-[#E14434]/[0.05] px-4 py-3 text-center">
              <p className="text-sm text-[#1C1917]">
                You scored <span className="font-bold">{score}/100</span>
                {issues > 0 && (
                  <>
                    {" · "}
                    <span className="font-bold text-[#B23A25]">
                      {issues} fixable issue{issues !== 1 ? "s" : ""}
                    </span>{" "}
                    found
                  </>
                )}
              </p>
              <p className="mt-0.5 text-[11px] text-[#857b6e]">
                {issues > 0
                  ? "Every fix — ranked by measured impact — is inside."
                  : "See exactly how far this photo can go."}
              </p>
            </div>
          )}

          {/* What you get */}
          <div className="mb-5 space-y-2.5">
            {FEATURES.map((f) => (
              <div key={f.text} className="flex items-start gap-2.5">
                <span className="mt-0.5 text-sm">{f.icon}</span>
                <span className="text-xs text-[#4a443d]">{f.text}</span>
              </div>
            ))}
          </div>

          {/* Price */}
          <div className="mb-4 rounded-xl border border-[#1c1917]/10 bg-[#1c1917]/[0.03] p-4 text-center">
            <div className="text-3xl font-bold text-[#1C1917]">{formatPrice(PAYMENT_PRODUCTS.aura_report.price)}</div>
            <div className="text-[11px] text-[#857b6e]">One-time payment · No subscription · Yours forever</div>
          </div>

          {/* CTA */}
          <Link href={`/unlock?auditId=${auditId}&product=aura_report`} className="block">
            <Button size="lg" className="w-full text-base font-bold">
              Unlock Now — {formatPrice(PAYMENT_PRODUCTS.aura_report.price)}
            </Button>
          </Link>

          <p className="mt-3 text-center text-[10px] text-[#9c9184]">
            Secure payment via Razorpay · Instant access
          </p>
        </div>
      </FadeInView>
    </div>
  );
}
