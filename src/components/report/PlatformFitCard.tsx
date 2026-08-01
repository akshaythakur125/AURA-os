"use client";

import { Card } from "@/components/ui/Card";
import { FadeInView } from "@/components/ui/FadeInView";
import { computePlatformFit, type PlatformFitInput } from "@/lib/aura-engine/platformFit";

const TIER_COLOR: Record<string, string> = {
  "Strong fit": "text-emerald-600",
  "Good fit": "text-[#B23A25]",
  Workable: "text-amber-600",
  "Weak fit": "text-[#857b6e]",
};

/**
 * "Where to post this photo" — ranks the current photo across platforms using
 * the already-measured image signals. Purely on-device: no API, no cost.
 */
export function PlatformFitCard({ metrics }: { metrics: PlatformFitInput }) {
  const fits = computePlatformFit(metrics);
  if (fits.length === 0) return null;
  const best = fits[0];

  return (
    <FadeInView>
      <Card className="mb-6">
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-[#1C1917]">Where to post this photo</h3>
          <p className="mt-0.5 text-xs text-[#857b6e]">
            The same shot scored as a lead image on each platform — post it where it&apos;s strongest.
          </p>
        </div>

        {/* Best home for this photo */}
        <div className="mb-4 flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.06] p-3">
          <span className="text-2xl">{best.emoji}</span>
          <div className="min-w-0">
            <p className="text-[11px] font-medium uppercase tracking-wide text-emerald-600">
              Best home for this photo
            </p>
            <p className="text-sm font-semibold text-[#1C1917]">
              {best.platform} · {best.score}/100
            </p>
          </div>
        </div>

        {/* Ranked list */}
        <div className="space-y-3">
          {fits.map((f) => (
            <div key={f.platform} className="rounded-xl border border-[#1c1917]/[0.07] p-3">
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm">{f.emoji}</span>
                  <span className="text-sm font-medium text-[#1C1917]">{f.platform}</span>
                </div>
                <span className={`text-xs font-semibold ${TIER_COLOR[f.tier]}`}>{f.tier}</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-[#1c1917]/[0.08]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#E14434] to-[#ff8a4c]"
                  style={{ width: `${f.score}%` }}
                />
              </div>
              <p className="mt-1.5 text-[11px] leading-relaxed text-[#6f675e]">{f.why}</p>
            </div>
          ))}
        </div>
      </Card>
    </FadeInView>
  );
}
