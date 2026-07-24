"use client";

import { useMemo } from "react";
import { getSocialProof } from "@/lib/social-proof/getSocialProof";

interface Props {
  variant?: "results" | "unlock";
}

export function PaymentTrust({ variant = "results" }: Props) {
  const proof = useMemo(() => getSocialProof(), []);

  return (
    <div className="space-y-3">
      {/* Social proof numbers */}
      {proof.totalChecks > 0 && (
        <div className="flex items-center justify-center gap-4 text-xs text-[#857b6e]">
          <span>
            <span className="font-medium text-[#1C1917]">{proof.totalChecks.toLocaleString()}</span> checks completed
          </span>
          {proof.checksToday > 0 && (
            <>
              <span className="h-1 w-1 rounded-full bg-gray-600" />
              <span>
                <span className="font-medium text-[#1C1917]">{proof.checksToday}</span> today
              </span>
            </>
          )}
        </div>
      )}

      {/* Guarantee */}
      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-center">
        <div className="flex items-center justify-center gap-2">
          <svg className="h-4 w-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <span className="text-sm font-medium text-emerald-400">Satisfaction Promise</span>
        </div>
        <p className="mt-2 text-xs text-[#6f675e]">
          If this doesn&apos;t feel accurate, tell us — we&apos;ll make it right.
        </p>
      </div>

      {/* What the report actually catches — illustrative, not fabricated reviews */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-[#1c1917]/[0.08] bg-[#1c1917]/[0.02] p-3.5">
          <div className="mb-2 inline-flex items-center rounded-full border border-red-400/20 bg-red-500/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-red-300">
            Lighting
          </div>
          <p className="text-[11px] leading-relaxed text-[#6f675e]">
            Overhead light flattens your face and quietly ages you — and you almost never
            catch it in your own photos. The report flags it and hands you the exact swap
            (window light, 45° to your face) that makes a shot read intentional instead of
            accidental.
          </p>
        </div>
        <div className="rounded-lg border border-[#1c1917]/[0.08] bg-[#1c1917]/[0.02] p-3.5">
          <div className="mb-2 inline-flex items-center rounded-full border border-red-400/20 bg-red-500/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-red-300">
            Background
          </div>
          <p className="text-[11px] leading-relaxed text-[#6f675e]">
            A cluttered background steals attention off you — even when your outfit is on point.
            Clearing what&apos;s behind you is usually the single highest-leverage free fix, and
            the report tells you exactly what to move, so you spend zero rupees to look sharper.
          </p>
        </div>
      </div>

      {/* Instant unlock reassurance */}
      {variant === "unlock" && (
        <div className="flex items-center justify-center gap-4 text-[10px] text-[#9c9184]">
          <span>Instant unlock</span>
          <span className="h-1 w-1 rounded-full bg-gray-600" />
          <span>No subscription</span>
          <span className="h-1 w-1 rounded-full bg-gray-600" />
          <span>Yours forever</span>
        </div>
      )}
    </div>
  );
}
