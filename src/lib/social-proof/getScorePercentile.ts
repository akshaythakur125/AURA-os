import { getAudits } from "@/lib/storage/auditStore";

export function getScorePercentile(score: number): number {
  const audits = getAudits();
  const scores = audits
    .map((a) => a.freeScore)
    .filter((s): s is number => s !== undefined && s !== null);
  if (scores.length === 0) return 50;
  const below = scores.filter((s) => s < score).length;
  return Math.round((below / scores.length) * 100);
}
