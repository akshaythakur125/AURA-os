import { getSupabaseClient } from "@/lib/supabase/client";
import { getAudits } from "@/lib/storage/auditStore";

export async function getScorePercentileAsync(score: number): Promise<number> {
  const supabase = getSupabaseClient();
  if (!supabase) return getScorePercentile(score);

  try {
    const { data, error } = await supabase.rpc("get_score_percentile", {
      input_score: score,
    });
    if (error || data === null || data === undefined) return getScorePercentile(score);
    return data as number;
  } catch {
    return getScorePercentile(score);
  }
}

// Estimate a percentile from the score alone, for when we don't have a real
// population to compare against. Tuned to how AuraCheck scores distribute (most
// land 45–85). Monotonic, so a higher score always reads better — and a good
// score never degrades to a demoralizing "Bottom 0%".
function estimatePercentileFromScore(score: number): number {
  const p = Math.round((score - 32) * 1.35);
  return Math.max(3, Math.min(97, p));
}

export function getScorePercentile(score: number): number {
  const audits = getAudits();
  const scores = audits
    .map((a) => a.freeScore)
    .filter((s): s is number => s !== undefined && s !== null);
  // A handful of the user's OWN past checks is not a population — comparing a
  // score against it (and telling them "X% scored lower") is misleading, and
  // for a first-time user with one check it collapses to "Bottom 0%". Only
  // trust a real cross-user comparison once the sample is genuinely large;
  // otherwise estimate from the score itself.
  if (scores.length < 30) return estimatePercentileFromScore(score);
  const below = scores.filter((s) => s < score).length;
  return Math.round((below / scores.length) * 100);
}
