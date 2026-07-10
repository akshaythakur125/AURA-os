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

export function getScorePercentile(score: number): number {
  const audits = getAudits();
  const scores = audits
    .map((a) => a.freeScore)
    .filter((s): s is number => s !== undefined && s !== null);
  if (scores.length === 0) return 50;
  const below = scores.filter((s) => s < score).length;
  return Math.round((below / scores.length) * 100);
}
