import type { LaunchScore, LaunchCategory, LaunchLabel } from "@/types/launch";

export function computeLaunchScore(categories: LaunchCategory[]): LaunchScore {
  let total = 0;
  let maxTotal = 0;

  for (const cat of categories) {
    // Compute category score from checks
    let catScore = 0;
    for (const check of cat.checks) {
      if (check.status === "pass") catScore += Math.round(cat.maxScore / cat.checks.length);
      if (check.status === "warning") catScore += Math.round(cat.maxScore / cat.checks.length * 0.5);
      if (check.status === "manual") catScore += Math.round(cat.maxScore / cat.checks.length * 0.3);
      // fail adds 0
    }
    cat.score = Math.min(cat.maxScore, catScore);
    total += cat.score;
    maxTotal += cat.maxScore;
  }

  const finalScore = Math.round((total / maxTotal) * 100);
  let label: LaunchLabel;

  if (finalScore >= 90) label = "production_ready";
  else if (finalScore >= 75) label = "soft_launch";
  else if (finalScore >= 50) label = "test_mode";
  else label = "not_ready";

  return { total: finalScore, categories, label };
}

export function getScoreSummary(categories: LaunchCategory[]): { pass: number; fail: number; warning: number; manual: number; total: number } {
  let pass = 0, fail = 0, warning = 0, manual = 0;

  for (const cat of categories) {
    for (const check of cat.checks) {
      if (check.status === "pass") pass++;
      else if (check.status === "fail") fail++;
      else if (check.status === "warning") warning++;
      else if (check.status === "manual") manual++;
    }
  }

  return { pass, fail, warning, manual, total: pass + fail + warning + manual };
}
