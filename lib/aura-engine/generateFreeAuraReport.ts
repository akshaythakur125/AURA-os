import type { BudgetRange, FreeAuraResult, Audit } from "@/types";
import { extractImageMetrics } from "@/lib/aura-engine/imageMetrics";
import { computeAuraScore, getCategory, getVerdict, getStrongestSignals, generateStatusLeaks, generateQuickFixes } from "@/lib/aura-engine/scoring";
import { getBudgetPlans } from "@/lib/aura-engine/budgetPlans";
import { generateStatusArchetype } from "@/lib/aura-engine/archetypes";

export async function generateFreeAuraReport(imageDataUrl: string, budgetRange: BudgetRange): Promise<FreeAuraResult> {
  const imageMetrics = await extractImageMetrics(imageDataUrl);
  const auraScore = computeAuraScore(imageMetrics);
  const category = getCategory(auraScore);
  const oneLineVerdict = getVerdict(auraScore);
  const strongestSignals = getStrongestSignals(imageMetrics);
  const statusLeaks = generateStatusLeaks(imageMetrics);
  const quickFixes = generateQuickFixes(imageMetrics);
  const budgetUpgradePlan = getBudgetPlans(budgetRange);

  return {
    auraScore,
    category,
    oneLineVerdict,
    strongestSignals,
    statusLeaks,
    quickFixes,
    budgetUpgradePlan,
    imageMetrics,
    generatedAt: new Date().toISOString(),
  };
}

export async function generateFreeReportWithPersonalization(audit: Audit): Promise<{ freeResult: FreeAuraResult; personalization: ReturnType<typeof generateStatusArchetype> }> {
  const freeResult = await generateFreeAuraReport(audit.imageDataUrl, audit.budgetRange);
  const personalization = generateStatusArchetype(audit, freeResult.imageMetrics);
  return { freeResult, personalization };
}
