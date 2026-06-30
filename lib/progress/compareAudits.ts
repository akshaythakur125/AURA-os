import type { Audit } from "@/types";
import type { ProgressComparison } from "@/types/progress";

export function compareAudits(before: Audit, after: Audit): Omit<ProgressComparison, "id" | "createdAt"> {
  const beforeScore = before.freeScore ?? before.fullScore ?? 0;
  const afterScore = after.freeScore ?? after.fullScore ?? 0;
  const scoreDelta = afterScore - beforeScore;

  const improvedSignals: string[] = [];
  const remainingLeaks: string[] = [];

  const beforeLeaks = before.freeResult?.statusLeaks ?? [];
  const afterLeaks = after.freeResult?.statusLeaks ?? [];

  const beforeSevere = beforeLeaks.filter((l) => l.severity === "high" || l.severity === "medium").length;
  const afterSevere = afterLeaks.filter((l) => l.severity === "high" || l.severity === "medium").length;

  if (afterScore > beforeScore) improvedSignals.push("Overall aura score");
  if (before.freeResult?.imageMetrics && after.freeResult?.imageMetrics) {
    if (after.freeResult.imageMetrics.lightingScore > before.freeResult.imageMetrics.lightingScore) improvedSignals.push("Lighting");
    if (after.freeResult.imageMetrics.clarityScore > before.freeResult.imageMetrics.clarityScore) improvedSignals.push("Clarity");
    if (after.freeResult.imageMetrics.compositionScore > before.freeResult.imageMetrics.compositionScore) improvedSignals.push("Composition");
    if (after.freeResult.imageMetrics.backgroundComplexityEstimate < before.freeResult.imageMetrics.backgroundComplexityEstimate) improvedSignals.push("Background control");
  }
  if (afterSevere < beforeSevere) improvedSignals.push("Fewer severe status leaks");

  for (const leak of afterLeaks) {
    if (leak.severity === "high" || leak.severity === "medium") remainingLeaks.push(leak.title);
  }

  const maxLen = 5;
  const improved = improvedSignals.slice(0, maxLen);
  const remaining = remainingLeaks.length > 0 ? remainingLeaks.slice(0, maxLen) : ["None detected"];

  const deltaText = scoreDelta >= 0 ? `improved by ${scoreDelta} points` : `dropped by ${Math.abs(scoreDelta)} points`;
  const improvementText = improved.length > 0 ? ` Biggest improvement: ${improved[0]}.` : "";
  const remainingText = remaining.length > 0 && remaining[0] !== "None detected" ? ` Remaining: ${remaining[0]}.` : "";
  const summary = `Your score ${deltaText}.${improvementText}${remainingText}`;

  return {
    beforeAuditId: before.id,
    afterAuditId: after.id,
    beforeScore,
    afterScore,
    scoreDelta,
    improvedSignals: improved,
    remainingLeaks: remaining,
    summary,
  };
}
