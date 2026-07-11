"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { CountUp } from "@/components/ui/CountUp";
import { SocialProofBar } from "@/components/social-proof/SocialProofBar";
import { FadeInView } from "@/components/ui/FadeInView";

interface ConversionFunnelProps {
  auditId: string;
  score: number;
  leakCount: number;
  topLeakTitle: string;
}

/**
 * Prominent conversion funnel — appears RIGHT AFTER the score,
 * not buried at the bottom. This is the money-maker.
 */
export function ConversionFunnel({
  auditId,
  score,
  leakCount,
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

          <p className="mb-3 text-sm text-gray-300">
            Your score is{" "}
            <span className="font-bold text-white">{score}/100</span>. We found{" "}
            <span className="font-bold text-red-400">
              {leakCount} status leak{leakCount !== 1 ? "s" : ""}
            </span>{" "}
            pulling your impression down.
          </p>

          {/* Anchoring — celebrity benchmark */}
          <div className="mx-auto mb-3 flex max-w-xs items-center justify-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.03] p-3">
            <div className="text-center">
              <div className="text-[10px] text-gray-500">Celebrity benchmark</div>
              <div className="text-sm font-bold text-amber-400">94</div>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div className="text-center">
              <div className="text-[10px] text-gray-500">Your score</div>
              <div className="text-sm font-bold text-white">{score}</div>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div className="text-center">
              <div className="text-[10px] text-gray-500">Gap to close</div>
              <div className="text-sm font-bold text-red-400">{Math.max(0, 94 - score)}</div>
            </div>
          </div>

          <p className="mb-4 text-xs text-gray-400">
            The #1 issue:{" "}
            <span className="font-medium text-white">{topLeakTitle}</span>
          </p>

          {/* Social proof */}
          <SocialProofBar variant="compact" />
        </div>
      </FadeInView>

      {/* The CTA — big, impossible to miss */}
      <FadeInView delay={100}>
        <div className="rounded-2xl border border-purple-500/30 bg-gradient-to-br from-purple-600/20 via-purple-500/10 to-pink-500/10 p-6 text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-purple-400/30 bg-purple-500/20 px-3 py-1">
            <span className="text-xs">🚀</span>
            <span className="text-xs font-semibold text-purple-200">
              Users improved by +18 points on average
            </span>
          </div>

          <h3 className="mb-2 text-lg font-bold text-white">
            Unlock Your Full Aura Report
          </h3>
          <p className="mx-auto mb-5 max-w-sm text-sm text-gray-400">
            Get your complete analysis with personalized fixes, budget plans, and
            celebrity style matches.
          </p>

          {/* Feature pills */}
          <div className="mx-auto mb-5 flex max-w-md flex-wrap justify-center gap-2">
            {[
              { emoji: "🎯", text: "All leaks identified" },
              { emoji: "📊", text: "Improvement score" },
              { emoji: "✨", text: "Celebrity match" },
              { emoji: "🛍️", text: "Shop the look" },
              { emoji: "📍", text: "Nearby salons & gyms" },
              { emoji: "💰", text: "Budget upgrade plan" },
            ].map((f) => (
              <span
                key={f.text}
                className="inline-flex items-center gap-1 rounded-full border border-white/[0.06] bg-white/[0.04] px-2.5 py-1 text-[10px] text-gray-300"
              >
                {f.emoji} {f.text}
              </span>
            ))}
          </div>

          {/* The button */}
          <Link
            href={`/unlock?auditId=${auditId}&product=aura_report`}
            className="block"
          >
            <Button size="lg" className="w-full max-w-sm mx-auto text-base font-bold">
              Unlock Full Report — ₹<CountUp target={99} duration={800} />
            </Button>
          </Link>

          {/* Price anchoring */}
          <p className="mt-3 text-[11px] text-gray-500">
            ₹99 = less than a chai per day for a week. One-time payment, yours
            forever.
          </p>

          {/* Trust badges */}
          <div className="mt-4 flex items-center justify-center gap-4 text-[10px] text-gray-500">
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

          {/* Testimonials */}
          <div className="mt-5 space-y-2">
            {[
              {
                name: "Priya, Delhi",
                text: "Went from 38 → 74 in two weeks. The lighting fix alone changed everything.",
              },
              {
                name: "Arjun, Mumbai",
                text: "The budget plan showed me ₹500 changes that made my profile look 10x better.",
              },
              {
                name: "Sneha, Bangalore",
                text: "Finally understood why my photos weren't hitting. This report nailed it.",
              },
            ].map((t) => (
              <div
                key={t.name}
                className="flex items-start gap-2 rounded-lg bg-white/[0.03] px-3 py-2 text-left"
              >
                <span className="mt-0.5 text-amber-400">★</span>
                <div>
                  <p className="text-[11px] text-gray-300">{t.text}</p>
                  <p className="mt-0.5 text-[10px] text-gray-500">
                    — {t.name}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </FadeInView>
    </div>
  );
}
