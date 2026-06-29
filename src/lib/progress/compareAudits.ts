import type { Audit } from "@/types/audit";
import type { ProgressComparison } from "@/types/progress";
import { createLocalId } from "@/types/audit";

export function compareAudits(
  beforeAudit: Audit,
  afterAudit: Audit
): ProgressComparison {
  const beforeScore = beforeAudit.freeScore ?? beforeAudit.fullScore ?? 0;
  const afterScore = afterAudit.freeScore ?? afterAudit.fullScore ?? 0;
  const scoreDelta = afterScore - beforeScore;

  const beforeMetrics = beforeAudit.fullReport?.freeResult?.imageMetrics;
  const afterMetrics = afterAudit.fullReport?.freeResult?.imageMetrics;

  const improvedSignals: string[] = [];
  const remainingLeaks: string[] = [];

  if (beforeMetrics && afterMetrics) {
    if (afterMetrics.lightingScore > beforeMetrics.lightingScore + 3) {
      improvedSignals.push("Lighting");
    } else if (afterMetrics.lightingScore < beforeMetrics.lightingScore - 3) {
      remainingLeaks.push("Lighting declined");
    } else {
      remainingLeaks.push("Lighting");
    }

    if (afterMetrics.clarityScore > beforeMetrics.clarityScore + 3) {
      improvedSignals.push("Clarity");
    } else if (afterMetrics.clarityScore < beforeMetrics.clarityScore - 3) {
      remainingLeaks.push("Clarity declined");
    } else {
      remainingLeaks.push("Clarity");
    }

    if (afterMetrics.compositionScore > beforeMetrics.compositionScore + 3) {
      improvedSignals.push("Composition");
    } else {
      remainingLeaks.push("Composition");
    }

    if (afterMetrics.backgroundComplexityEstimate < beforeMetrics.backgroundComplexityEstimate - 5) {
      improvedSignals.push("Background control");
    } else if (afterMetrics.backgroundComplexityEstimate > beforeMetrics.backgroundComplexityEstimate + 5) {
      remainingLeaks.push("Background control");
    }
  }

  const beforeLeaks = beforeAudit.fullReport?.freeResult?.statusLeaks || [];
  const afterLeaks = afterAudit.fullReport?.freeResult?.statusLeaks || [];

  if (afterLeaks.length < beforeLeaks.length) {
    improvedSignals.push(`${beforeLeaks.length - afterLeaks.length} fewer status leaks`);
  } else if (afterLeaks.length > beforeLeaks.length) {
    remainingLeaks.push(`${afterLeaks.length - beforeLeaks.length} new status leaks detected`);
  }

  const beforeArchetype = beforeAudit.personalization?.archetype;
  const afterArchetype = afterAudit.personalization?.archetype;
  if (beforeArchetype && afterArchetype && beforeArchetype !== afterArchetype) {
    improvedSignals.push(`Archetype shift: ${beforeArchetype} → ${afterArchetype}`);
  }

  let summary = "";
  if (scoreDelta > 0) {
    summary = `Your score improved by ${scoreDelta} points.`;
    if (improvedSignals.length > 0) {
      summary += ` Biggest improvement: ${improvedSignals[0]}.`;
    }
    if (remainingLeaks.length > 0) {
      summary += ` Remaining to work on: ${remainingLeaks[0]}.`;
    }
  } else if (scoreDelta < 0) {
    summary = `Your score decreased by ${Math.abs(scoreDelta)} points.`;
    if (remainingLeaks.length > 0) {
      summary += ` Main factor: ${remainingLeaks[0]}.`;
    }
    summary += " Try using consistent lighting, background, and framing.";
  } else {
    summary = "Your score stayed the same.";
    if (remainingLeaks.length > 0) {
      summary += ` Focus on improving: ${remainingLeaks[0]}.`;
    }
  }

  return {
    id: createLocalId(),
    beforeAuditId: beforeAudit.id,
    afterAuditId: afterAudit.id,
    beforeScore,
    afterScore,
    scoreDelta,
    improvedSignals,
    remainingLeaks,
    summary,
    createdAt: new Date().toISOString(),
  };
}
