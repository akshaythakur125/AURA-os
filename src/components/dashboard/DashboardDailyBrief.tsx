"use client";

import { useMemo } from "react";
import type { Audit } from "@/types/audit";
import { DailyAuraBrief } from "./DailyAuraBrief";
import type { BriefTraits } from "@/lib/daily/dailyBrief";

/**
 * Dashboard mount for the Daily Aura Brief — rebuilds the trait inputs from the
 * user's latest scan (available on the free result too, so it's a daily return
 * hook for everyone, not only paying users). Renders nothing until there's a
 * scan to personalise from.
 */
export function DashboardDailyBrief({ audits }: { audits: Audit[] }) {
  const traits = useMemo<BriefTraits | null>(() => {
    const a = audits.find((x) => x.fullReport?.freeResult?.imageMetrics);
    if (!a) return null;
    const m = a.fullReport!.freeResult!.imageMetrics;
    const undertone = m.undertone?.undertone;
    return {
      powerColors: m.colorPalette?.colors,
      neutralDark: undertone === "warm" ? "chocolate brown" : "charcoal",
      oily: (m.skinDetail?.shine ?? 0) >= 58,
      gender: a.gender,
    };
  }, [audits]);

  if (!traits) return null;
  return <DailyAuraBrief {...traits} />;
}
