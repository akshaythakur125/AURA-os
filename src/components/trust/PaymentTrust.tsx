"use client";
import { PAYMENT_PRODUCTS, formatPrice } from "@/config/pricing";

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
        <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
          <span>
            <span className="font-medium text-white">{proof.totalChecks.toLocaleString()}</span> checks completed
          </span>
          {proof.checksToday > 0 && (
            <>
              <span className="h-1 w-1 rounded-full bg-gray-600" />
              <span>
                <span className="font-medium text-white">{proof.checksToday}</span> today
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
        <p className="mt-2 text-xs text-gray-400">
          If this doesn&apos;t feel accurate, tell us — we&apos;ll make it right.
        </p>
      </div>

      {/* Testimonial-style trust signals */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-white/[0.04] bg-white/[0.02] p-3">
          <div className="flex items-center gap-1 text-amber-400">
            {[...Array(5)].map((_, i) => (
              <svg key={i} className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <p className="mt-2 text-[11px] text-gray-400">
            &ldquo;Spot-on. The lighting leak was exactly what I needed to fix.&rdquo;
          </p>
        </div>
        <div className="rounded-lg border border-white/[0.04] bg-white/[0.02] p-3">
          <div className="flex items-center gap-1 text-amber-400">
            {[...Array(5)].map((_, i) => (
              <svg key={i} className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <p className="mt-2 text-[11px] text-gray-400">
            &ldquo;Worth {formatPrice(PAYMENT_PRODUCTS.aura_report.price)} just for the background tips. Saved me thousands.&rdquo;
          </p>
        </div>
      </div>

      {/* Instant unlock reassurance */}
      {variant === "unlock" && (
        <div className="flex items-center justify-center gap-4 text-[10px] text-gray-600">
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
