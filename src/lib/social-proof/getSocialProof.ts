import { getSupabaseClient } from "@/lib/supabase/client";
import { getAudits, getAuditStats } from "@/lib/storage/auditStore";

export interface SocialProofData {
  checksToday: number;
  totalChecks: number;
  unlocksToday: number;
  averageScore: number | null;
  percentile: (score: number) => number;
}

export async function getSocialProofAsync(): Promise<SocialProofData> {
  const supabase = getSupabaseClient();
  if (!supabase) return getSocialProof();

  try {
    const { data, error } = await supabase.rpc("get_social_proof");
    if (error || !data) return getSocialProof();

    const row = Array.isArray(data) ? data[0] : data;

    return {
      checksToday: row.checks_today ?? 0,
      totalChecks: row.total_checks ?? 0,
      unlocksToday: row.unlocks_today ?? 0,
      averageScore: row.average_score ?? null,
      percentile: (score: number) => getScorePercentileSync(score),
    };
  } catch {
    return getSocialProof();
  }
}

export function getSocialProof(): SocialProofData {
  const today = getCountsToday();
  const total = getTotalChecks();
  const avg = getAverageScore();

  return {
    checksToday: today.checks,
    totalChecks: total,
    unlocksToday: today.unlocks,
    averageScore: avg,
    percentile: getScorePercentileSync,
  };
}

function getCountsToday(): { checks: number; unlocks: number } {
  const today = getTodayKey();
  const audits = getAudits();
  const todayAudits = audits.filter((a) => a.createdAt.startsWith(today));
  return {
    checks: todayAudits.filter((a) => a.reportStatus !== "draft").length,
    unlocks: todayAudits.filter((a) => a.unlockStatus === "unlocked").length,
  };
}

function getTotalChecks(): number {
  return getAudits().filter((a) => a.reportStatus !== "draft").length;
}

function getAverageScore(): number | null {
  return getAuditStats().averageFreeScore;
}

function getTodayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function getScorePercentileSync(score: number): number {
  const audits = getAudits();
  const scores = audits
    .map((a) => a.freeScore)
    .filter((s): s is number => s !== undefined && s !== null);
  if (scores.length === 0) return 50;
  const below = scores.filter((s) => s < score).length;
  return Math.round((below / scores.length) * 100);
}
