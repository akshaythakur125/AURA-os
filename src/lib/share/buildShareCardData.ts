import type { Audit } from "@/types/audit";
import type { ShareCardData, ShareCardType } from "@/types/share";

export function buildShareCardData(
  audit: Audit,
  type: ShareCardType
): ShareCardData {
  const fullContent = audit.fullReport?.fullContent;
  const freeResult = audit.fullReport?.freeResult;

  if (type === "full_report" && fullContent) {
    return {
      auditId: audit.id,
      auraScore: fullContent.fullScore,
      category: fullContent.category,
      oneLineVerdict: fullContent.detailedVerdict,
      biggestStatusLeak: fullContent.biggestStatusLeaks[0]?.title,
      strongestSignal: fullContent.strongestSignals[0],
      quickFix: fullContent.biggestStatusLeaks[0]?.fix,
      goal: audit.goal,
      auditType: audit.auditType,
      imageDataUrl: audit.imageDataUrl,
      generatedAt: fullContent.generatedAt,
      archetype: audit.personalization?.archetype,
    };
  }

  if (freeResult) {
    const biggestLeak = freeResult.statusLeaks.reduce(
      (max, l) => (l.impactScore > (max?.impactScore || 0) ? l : max),
      freeResult.statusLeaks[0]
    );

    return {
      auditId: audit.id,
      auraScore: freeResult.auraScore,
      category: freeResult.category,
      oneLineVerdict: freeResult.oneLineVerdict,
      biggestStatusLeak: biggestLeak?.title,
      strongestSignal: freeResult.strongestSignals[0],
      quickFix: freeResult.quickFixes[0]?.title,
      goal: audit.goal,
      auditType: audit.auditType,
      imageDataUrl: audit.imageDataUrl,
      generatedAt: freeResult.generatedAt,
      archetype: audit.personalization?.archetype,
    };
  }

  return {
    auditId: audit.id,
    auraScore: 0,
    category: "No score yet",
    oneLineVerdict: "Run a free Aura Check to see your score.",
    goal: audit.goal,
    auditType: audit.auditType,
    generatedAt: new Date().toISOString(),
  };
}
