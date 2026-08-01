"use client";

import Link from "next/link";
import { useMemo } from "react";
import type { Audit } from "@/types/audit";
import { buildStylePassport, type Undertone } from "@/lib/style/passport";
import { buildStylePassportHtml } from "@/lib/share/passportArtifact";
import { downloadTextFile } from "@/lib/share/download";
import { scentProfileFor } from "@/lib/shop/scentGrooming";

/**
 * Home-base quick access to the user's Style Passport. When a returning user
 * lands on the dashboard, their keepable style spec is right there to
 * re-download — no need to reopen the report. Rebuilt from the latest unlocked
 * audit's persisted traits. (Face-shape detail lives in the full report, linked
 * below, since it isn't persisted.)
 */
export function DashboardPassport({ audits }: { audits: Audit[] }) {
  const built = useMemo(() => {
    const a = audits.find(
      (x) => x.reportStatus === "unlocked" && x.fullReport?.freeResult?.imageMetrics && x.personalization?.archetype,
    );
    if (!a) return null;
    const m = a.fullReport!.freeResult!.imageMetrics;
    const archetype = a.personalization!.archetype;
    const confident = (m.undertone?.confidence ?? 0) >= 45;
    const scent = scentProfileFor(archetype, a.goal ?? undefined);
    const data = buildStylePassport({
      undertone: m.undertone?.undertone as Undertone | undefined,
      undertoneConfident: confident,
      paletteName: m.colorPalette?.name,
      powerColors: m.colorPalette?.colors,
      avoidColors: m.colorPalette?.avoid,
      archetype,
      detectedStyle: m.detectedStyle?.detectedStyle,
      scentFamilies: scent.families,
      scentReason: scent.reason,
      groomingFocus: m.groomingResult?.topFix,
      goal: a.goal,
    });
    return { data, auditId: a.id };
  }, [audits]);

  if (!built) return null;
  const { data, auditId } = built;

  return (
    <div className="mb-8 rounded-2xl border border-[#E14434]/20 bg-gradient-to-b from-[#E14434]/[0.05] to-transparent p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#B23A25]">Your Style Passport</p>
          <p className="mt-0.5 text-sm font-bold text-[#1C1917]">{data.headline}</p>
          <p className="mt-0.5 text-xs text-[#6f675e]">Your colours, metals, scent and grooming spec — keep it on your phone for shopping and salon trips.</p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <button
            onClick={() => downloadTextFile(buildStylePassportHtml(data), "my-style-passport.html", "text/html")}
            className="rounded-xl bg-[#1C1917] px-3.5 py-2 text-xs font-semibold text-white transition-transform hover:-translate-y-0.5"
          >
            ⬇ Download
          </button>
          <Link
            href={`/audit/${auditId}`}
            className="rounded-xl border border-[#1c1917]/12 px-3.5 py-2 text-xs font-semibold text-[#4a443d] transition-colors hover:border-[#E14434]/40 hover:text-[#1C1917]"
          >
            Open full report →
          </Link>
        </div>
      </div>
      {data.powerColors.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {data.powerColors.slice(0, 5).map((c) => (
            <span key={c} className="rounded-full border border-[#E14434]/30 bg-[#E14434]/[0.05] px-2.5 py-0.5 text-[11px] capitalize text-[#B23A25]">{c}</span>
          ))}
        </div>
      )}
    </div>
  );
}
