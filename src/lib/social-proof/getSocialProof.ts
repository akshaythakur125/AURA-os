import { getAudits, getAuditStats } from "@/lib/storage/auditStore";

function getTodayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
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
  const audits = getAudits();
  return audits.filter((a) => a.reportStatus !== "draft").length;
}

function getAverageScore(): number | null {
  const stats = getAuditStats();
  return stats.averageFreeScore;
}

function getScorePercentile(score: number): number {
  const audits = getAudits();
  const scores = audits
    .map((a) => a.freeScore)
    .filter((s): s is number => s !== undefined && s !== null);
  if (scores.length === 0) return 50;
  const below = scores.filter((s) => s < score).length;
  return Math.round((below / scores.length) * 100);
}

export interface SocialProofData {
  checksToday: number;
  totalChecks: number;
  unlocksToday: number;
  averageScore: number | null;
  percentile: (score: number) => number;
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
    percentile: getScorePercentile,
  };
}
