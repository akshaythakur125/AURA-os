import type { Audit, AuraReport } from "@/types/audit";
import { createLocalId } from "@/types/audit";
import { calculateAuraScore } from "./scoring";
import { defaultTemplate } from "./reportTemplates";
import type { ScoringInput } from "./types";

export function generateReport(audit: Audit): AuraReport {
  const input: ScoringInput = {
    imageCount: audit.imageCount,
    type: audit.type,
    goal: audit.goal,
  };

  const result = calculateAuraScore(input);

  const summary = defaultTemplate.generateSummary(
    result.score,
    result.leaks
  );

  return {
    id: createLocalId(),
    auditId: audit.id,
    score: result.score,
    leaks: result.leaks,
    suggestions: result.suggestions,
    summary,
    createdAt: new Date().toISOString(),
    isPremium: false,
  };
}
