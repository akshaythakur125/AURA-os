"use client";
import { PAYMENT_PRODUCTS, formatPrice } from "@/config/pricing";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { CountUp } from "@/components/ui/CountUp";
import { SocialProofBar } from "@/components/social-proof/SocialProofBar";
import { FadeInView } from "@/components/ui/FadeInView";
import { trackEvent, EVENTS } from "@/lib/analytics/events";

interface ConversionFunnelProps {
  auditId: string;
  score: number;
  photoIssueCount: number;
  topLeakTitle: string;
  /** Measured evidence for the top leak, e.g. "Sharpness 38/100" — concrete proof. */
  topLeakEvidence?: string;
  /** The user's strongest measured signal, e.g. "Lighting" — credit before the tension. */
  strongestSignal?: string;
  /** Detected undertone + palette name — already computed, teased to prove the
   * value is a tap away (specificity converts better than a generic promise). */
  undertone?: "warm" | "cool" | "neutral";
  paletteName?: string;
}

/**
 * Prominent conversion funnel — appears RIGHT AFTER the score, not buried at the
 * bottom. This is the money-maker. It mirrors the measured teaser verdict:
 * credit for the real strength, then the biggest leak with its measured
 * evidence as proof, then an honest list of what the ₹21 actually delivers.
 */
export function ConversionFunnel({
  auditId,
  score,
  photoIssueCount,
  topLeakTitle,
  topLeakEvidence,
  strongestSignal,
  undertone,
  paletteName,
}: ConversionFunnelProps) {
  const strength = strongestSignal && !strongestSignal.toLowerCase().startsWith("potential")
    ? strongestSignal.toLowerCase().replace("color", "colour")
    : null;
  const paletteBullet = paletteName
    ? `Your ${paletteName} palette + a capsule wardrobe matched to your ${undertone ?? ""} undertone`.replace(/\s+/g, " ").trim()
    : "Your colour palette + capsule wardrobe matched to your undertone";
  return (
    <div className="mb-8 space-y-4">
      {/* Urgency hook */}
      <FadeInView>
        <div className="relative overflow-hidden rounded-2xl border border-red-500/20 bg-gradient-to-b from-red-500/[0.08] to-transparent p-5 text-center">
          <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-red-500/10 blur-3xl" />

          <Badge variant="danger" className="mb-3">
            ⚠️ {photoIssueCount} fixable issue{photoIssueCount !== 1 ? "s" : ""} found
          </Badge>

          <p className="mb-3 text-sm text-[#4a443d]">
            You scored <span className="font-bold text-[#1C1917]">{score}/100</span>
            {strength ? (
              <>. Your <span className="font-semibold text-[#1C1917]">{strength}</span> is genuinely working — but you&apos;re leaving points on the table.</>
            ) : (
              <>. {photoIssueCount !== 1 ? "Those issues are quietly costing you attention — and every one is fixable." : "That issue is quietly costing you attention — and it's fixable."}</>
            )}
          </p>

          <p className="mb-4 text-xs text-[#6f675e]">
            Biggest one right now:{" "}
            <span className="font-medium text-[#1C1917]">{topLeakTitle}</span>
            {topLeakEvidence ? <span className="text-[#857b6e]"> — {topLeakEvidence.toLowerCase()}</span> : null}
          </p>

          {/* Already-computed teaser — proof the value is done, one tap away. */}
          {(paletteName || undertone) && (
            <p className="mx-auto mb-3 max-w-sm rounded-lg border border-[#1c1917]/[0.08] bg-white/60 px-3 py-2 text-[11px] text-[#4a443d]">
              ✓ Already computed from your photo: your undertone reads{" "}
              <span className="font-semibold text-[#B23A25]">{undertone}</span>
              {paletteName ? (
                <> → your <span className="font-semibold text-[#1C1917]">{paletteName}</span> palette is ready to unlock.</>
              ) : (
                <>.</>
              )}
            </p>
          )}

          {/* Social proof */}
          <SocialProofBar variant="compact" />
        </div>
      </FadeInView>

      {/* The CTA — big, impossible to miss */}
      <FadeInView delay={100}>
        <div className="rounded-2xl border border-red-500/30 bg-gradient-to-br from-red-600/20 via-red-500/10 to-red-500/10 p-6 text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-red-400/30 bg-red-500/20 px-3 py-1">
            <span className="text-xs">🚀</span>
            <span className="text-xs font-semibold text-red-200">
              Most fixes are free once you know them
            </span>
          </div>

          <h3 className="mb-2 text-lg font-bold text-[#1C1917]">
            See exactly how to fix it — and how far this photo can go
          </h3>
          <ul className="mx-auto mb-5 max-w-sm space-y-1.5 text-left text-[13px] text-[#4a443d]">
            {[
              "Every issue with its exact fix, ranked by measured impact",
              "A 7-day reshoot plan built from your photo's own numbers",
              paletteBullet,
              "Expression & posture read, skin analysis, face-shape studio",
              "Shoppable picks in your budget",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="mt-0.5 text-emerald-500">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>

          {/* The button */}
          <Link
            href={`/unlock?auditId=${auditId}&product=aura_report`}
            className="block"
            onClick={() => trackEvent(EVENTS.PAYWALL_CTA_CLICKED, { auditId, productType: "aura_report", source: "conversion_funnel" })}
          >
            <Button size="lg" className="w-full max-w-sm mx-auto text-base font-bold">
              Unlock My Full Report — ₹21
            </Button>
          </Link>

          {/* Price anchoring */}
          <p className="mx-auto mt-3 max-w-sm text-[11px] text-[#857b6e]">
            ₹21, one-time — less than a coffee, and it&apos;s yours forever. One
            photo that actually lands is worth far more.
          </p>

          {/* Trust badges */}
          <div className="mt-4 flex items-center justify-center gap-4 text-[10px] text-[#857b6e]">
            <span className="flex items-center gap-1">
              <span className="text-emerald-400">✓</span> Instant unlock
            </span>
            <span className="flex items-center gap-1">
              <span className="text-emerald-400">✓</span> No subscription
            </span>
            <span className="flex items-center gap-1">
              <span className="text-emerald-400">✓</span> Secure payment
            </span>
          </div>
        </div>
      </FadeInView>
    </div>
  );
}
