import type { Audit, FreeAuraResult, StatusLeak, QuickFix } from "@/types/audit";
import { createLocalId } from "@/types/audit";
import { analyzeImageDataUrl } from "./imageMetrics";
import { calculateAuraScore, determineCategory, generateVerdict } from "./scoring";
import { runIntelligenceAnalysis } from "./intelligence";
import type { IntelligenceResult } from "./intelligence";
import { getBudgetUpgradePlan } from "./budgetPlans";

function generateStatusLeaks(score: number, metrics: import("@/types/audit").ImageSignalMetrics): StatusLeak[] {
  const leaks: StatusLeak[] = [];

  if (metrics.lightingScore < 55) {
    leaks.push({
      id: createLocalId(),
      severity: metrics.lightingScore < 40 ? "high" : "medium",
      category: "lighting",
      title: "Your lighting is too dark or harsh",
      description: "Dark or harsh lighting makes you look less approachable and hides your best features.",
      fix: "Stand near a window during the day. Face the light, not away from it.",
      impactScore: Math.round((55 - metrics.lightingScore) * 1.2),
    });
  }

  if (metrics.sharpness < 55) {
    leaks.push({
      id: createLocalId(),
      severity: metrics.sharpness < 40 ? "high" : "medium",
      category: "clarity",
      title: "Your photo is blurry",
      description: "A blurry photo looks like an accident. People scroll past blurry images instantly.",
      fix: "Use the rear camera, clean the lens, and hold steady.",
      impactScore: Math.round((55 - metrics.sharpness) * 1.2),
    });
  }

  if (metrics.backgroundComplexityEstimate > 65) {
    leaks.push({
      id: createLocalId(),
      severity: metrics.backgroundComplexityEstimate > 75 ? "high" : "medium",
      category: "background",
      title: "Your background is too busy",
      description: "A messy or cluttered background pulls attention away from you.",
      fix: "Find a clean wall or simple background. Step away from clutter.",
      impactScore: Math.round((metrics.backgroundComplexityEstimate - 65) * 1.5),
    });
  }

  if (metrics.compositionScore < 55) {
    leaks.push({
      id: createLocalId(),
      severity: metrics.compositionScore < 40 ? "high" : "medium",
      category: "framing",
      title: "Your framing is off",
      description: "The photo is cropped awkwardly. It doesn't look intentional or profile-ready.",
      fix: "Center yourself in the frame with a little space above your head.",
      impactScore: Math.round((55 - metrics.compositionScore) * 1.2),
    });
  }

  const satDiff = Math.abs(metrics.saturation - 45);
  if (satDiff > 25) {
    leaks.push({
      id: createLocalId(),
      severity: satDiff > 35 ? "medium" : "low",
      category: "color",
      title: "Your colors look off",
      description: "The colors in your photo are either too dull or too oversaturated.",
      fix: "Use natural light and skip heavy filters.",
      impactScore: Math.round(satDiff * 0.6),
    });
  }

  if (metrics.resolutionScore < 50) {
    leaks.push({
      id: createLocalId(),
      severity: "low",
      category: "resolution",
      title: "Low resolution",
      description: "The image resolution may not display well on larger screens or profiles.",
      fix: "Upload a higher-resolution image captured with the rear camera in good light.",
      impactScore: Math.round((50 - metrics.resolutionScore) * 0.6),
    });
  }

  if (leaks.length === 0) {
    leaks.push({
      id: createLocalId(),
      severity: "low",
      category: "general",
      title: "Minor refinement opportunity",
      description: "Your presentation is already strong. Small tweaks can still elevate the overall signal.",
      fix: "Consider a wardrobe refresh or a new profile photo to keep your presentation current.",
      impactScore: 10,
    });
  }

  return leaks.slice(0, 5);
}

function generateQuickFixes(metrics: import("@/types/audit").ImageSignalMetrics): QuickFix[] {
  const fixes: QuickFix[] = [];

  if (metrics.lightingScore < 60) {
    fixes.push({
      title: "Use window light instead of overhead light",
      effort: "easy",
      cost: "free",
      description: "Natural side lighting softens the face and creates a more premium look.",
    });
  }

  if (metrics.sharpness < 60) {
    fixes.push({
      title: "Clean lens and use rear camera",
      effort: "easy",
      cost: "free",
      description: "The rear camera produces sharper images. Wipe the lens before shooting.",
    });
  }

  if (metrics.backgroundComplexityEstimate > 60) {
    fixes.push({
      title: "Simplify your background",
      effort: "easy",
      cost: "free",
      description: "Move clutter out of frame or stand further from background objects.",
    });
  }

  if (metrics.compositionScore < 60) {
    fixes.push({
      title: "Improve framing",
      effort: "easy",
      cost: "free",
      description: "Keep the subject centered with some headroom above and a clean crop.",
    });
  }

  fixes.push({
    title: "Wear solid, neutral colors",
    effort: "easy",
    cost: "free",
    description: "Solid colors create a cleaner signal than busy patterns in photos.",
  });

  return fixes.slice(0, 4);
}

function findStrongestSignals(metrics: import("@/types/audit").ImageSignalMetrics): string[] {
  const signals: string[] = [];

  if (metrics.lightingScore >= 65) signals.push("Lighting");
  if (metrics.sharpness >= 65) signals.push("Sharpness");
  if (metrics.compositionScore >= 65) signals.push("Composition");
  if (metrics.contrast >= 60) signals.push("Contrast");
  if (metrics.saturation >= 40 && metrics.saturation <= 60) signals.push("Color balance");
  if (metrics.resolutionScore >= 70) signals.push("Resolution");

  if (signals.length === 0) {
    signals.push("Potential for improvement across all signals");
  }

  return signals;
}

export async function generateFreeAuraReport(
  audit: Audit,
  visionResults?: {
    scores: { lighting: number; background: number; outfit: number; grooming: number; expression: number; overall: number };
    observations: Array<{ category: string; severity: string; title: string; detail: string; suggestion: string; confidence: number }>;
    topLeak?: string;
    quickFixes?: Array<{ title: string; description: string; impact: number }>;
    improvementTips?: string[];
  }
): Promise<FreeAuraResult> {
  if (!audit.imageDataUrl) {
    throw new Error("No image data available for this audit.");
  }
  const metrics = await analyzeImageDataUrl(audit.imageDataUrl);

  // Run intelligence analysis with vision results if available
  let intelligenceResult: IntelligenceResult | null = null;
  if (visionResults) {
    intelligenceResult = runIntelligenceAnalysis({
      goal: audit.goal,
      metrics,
      visionScores: visionResults.scores,
    });
  }

  const score = calculateAuraScore({
    auditType: audit.auditType,
    goal: audit.goal,
    budgetRange: audit.budgetRange,
    metrics,
  });

  const category = determineCategory(score, metrics);
  const oneLineVerdict = generateVerdict(score, category);
  const strongestSignals = findStrongestSignals(metrics);
  const statusLeaks = generateStatusLeaks(score, metrics);
  const quickFixes = generateQuickFixes(metrics);
  const budgetUpgradePlan = getBudgetUpgradePlan(audit.budgetRange);

  // If intelligence analysis ran, use its enhanced results
  if (intelligenceResult) {
    return {
      auraScore: intelligenceResult.auraScore,
      category,
      oneLineVerdict: intelligenceResult.goalSpecificAdvice || oneLineVerdict,
      strongestSignals: [
        ...strongestSignals,
        ...intelligenceResult.personalizedInsights.slice(0, 2),
      ],
      statusLeaks: statusLeaks.map((leak, i) => ({
        ...leak,
        description: intelligenceResult.observations[i]?.insight || leak.description,
        fix: intelligenceResult.observations[i]?.action || leak.fix,
      })),
      quickFixes: intelligenceResult.quickWins.map((qw) => ({
        title: qw.title,
        description: qw.description,
        effort: qw.effort,
        cost: "free",
      })),
      budgetUpgradePlan,
      imageMetrics: metrics,
      generatedAt: new Date().toISOString(),
    };
  }

  return {
    auraScore: score,
    category,
    oneLineVerdict,
    strongestSignals,
    statusLeaks,
    quickFixes,
    budgetUpgradePlan,
    imageMetrics: metrics,
    generatedAt: new Date().toISOString(),
  };
}
