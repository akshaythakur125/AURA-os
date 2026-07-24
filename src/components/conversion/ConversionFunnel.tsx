"use client";
import { PAYMENT_PRODUCTS, formatPrice } from "@/config/pricing";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { CountUp } from "@/components/ui/CountUp";
import { SocialProofBar } from "@/components/social-proof/SocialProofBar";
import { FadeInView } from "@/components/ui/FadeInView";

interface ConversionFunnelProps {
  auditId: string;
  score: number;
  photoIssueCount: number;
  topLeakTitle: string;
}

/**
 * Prominent conversion funnel — appears RIGHT AFTER the score,
 * not buried at the bottom. This is the money-maker.
 */
export function ConversionFunnel({
  auditId,
  score,
  photoIssueCount,
  topLeakTitle,
}: ConversionFunnelProps) {
  return (
    <div className="mb-8 space-y-4">
      {/* Urgency hook */}
      <FadeInView>
        <div className="relative overflow-hidden rounded-2xl border border-red-500/20 bg-gradient-to-b from-red-500/[0.08] to-transparent p-5 text-center">
          <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-red-500/10 blur-3xl" />

          <Badge variant="danger" className="mb-3">
            ⚠️ Your Score Reveals Something
          </Badge>

          <p className="mb-3 text-sm text-[#4a443d]">
            Your score is{" "}
            <span className="font-bold text-[#1C1917]">{score}/100</span>. We found{" "}
            <span className="font-bold text-red-400">
              {photoIssueCount} photo-quality issue{photoIssueCount !== 1 ? "s" : ""}
            </span>{" "}
            pulling your impression down.
          </p>



          <p className="mb-4 text-xs text-[#6f675e]">
            The #1 issue:{" "}
            <span className="font-medium text-[#1C1917]">{topLeakTitle}</span>
          </p>

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
              Small corrections make a meaningful difference
            </span>
          </div>

          <h3 className="mb-2 text-lg font-bold text-[#1C1917]">
            Unlock Your Full Aura Report
          </h3>
          <p className="mx-auto mb-5 max-w-sm text-sm text-[#6f675e]">
            Get your complete analysis with personalized fixes, budget plans, and
            celebrity style matches.
          </p>

          {/* Identity-based transformation hooks */}
          <div className="mx-auto mb-5 max-w-sm space-y-2">
            <p className="text-sm text-[#4a443d]">
              Small corrections to your top issues can make a significant difference to how your photo is perceived.
            </p>
            <p className="text-[11px] text-[#857b6e]">
              Your report includes a personalized roadmap, celebrity style matches, and exact products to buy — all under ₹100.
            </p>
          </div>

          {/* The button */}
          <Link
            href={`/unlock?auditId=${auditId}&product=aura_report`}
            className="block"
          >
            <Button size="lg" className="w-full max-w-sm mx-auto text-base font-bold">
              Unlock My Full Report — ₹25
            </Button>
          </Link>

          {/* Price anchoring */}
          <p className="mt-3 text-[11px] text-[#857b6e]">
            One-time payment. But the confidence from knowing your profile works? That pays for itself.
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
