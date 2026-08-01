import type { Audit, FreeAuraResult, StatusLeak, QuickFix } from "@/types/audit";
import { createLocalId } from "@/types/audit";
import { analyzeImageDataUrl } from "./imageMetrics";
import { calculateAuraScore, determineCategory } from "./scoring";
import { composeTeaserVerdict } from "./verdictComposer";
import { runIntelligenceAnalysis } from "./intelligence";
import type { IntelligenceResult } from "./intelligence";
import { getBudgetUpgradePlan } from "./budgetPlans";

function generateStatusLeaks(score: number, metrics: import("@/types/audit").ImageSignalMetrics): StatusLeak[] {
  const leaks: StatusLeak[] = [];
  const r = (n: number) => Math.round(n);

  if (metrics.lightingScore < 55) {
    // Prefer the tangible face-vs-background reading when the face is darker.
    const faceB = r(metrics.faceBrightness);
    const bgB = r(metrics.backgroundBrightness);
    const evidence =
      metrics.faceDetected && bgB > 0 && faceB < bgB - 8
        ? `Your face reads ${r(((bgB - faceB) / bgB) * 100)}% darker than your background`
        : `Lighting scored ${r(metrics.lightingScore)}/100 — well-lit photos land 70+`;
    leaks.push({
      id: createLocalId(),
      severity: metrics.lightingScore < 40 ? "high" : "medium",
      category: "lighting",
      title: "Your lighting is too dark or harsh",
      description: "Dark or harsh lighting makes you look less approachable and hides your best features.",
      fix: "Stand near a window during the day. Face the light, not away from it.",
      impactScore: Math.round((55 - metrics.lightingScore) * 1.2),
      evidence,
    });
  }

  if (metrics.sharpness < 55) {
    leaks.push({
      id: createLocalId(),
      severity: metrics.sharpness < 40 ? "high" : "medium",
      category: "clarity",
      title: "Your photo is blurry",
      description: "A blurry photo reduces visual clarity. Sharpening or retaking can significantly improve how you are perceived.",
      fix: "Use the rear camera, clean the lens, and hold steady.",
      impactScore: Math.round((55 - metrics.sharpness) * 1.2),
      evidence: `Sharpness scored ${r(metrics.sharpness)}/100 — crisp photos hit 70+`,
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
      evidence: `Background busyness ${r(metrics.backgroundComplexityEstimate)}/100 — clean shots stay under 40`,
    });
  }

  if (metrics.compositionScore < 55) {
    const off = r(Math.abs((metrics.subjectCenterX ?? 0.5) - 0.5) * 200);
    leaks.push({
      id: createLocalId(),
      severity: metrics.compositionScore < 40 ? "high" : "medium",
      category: "framing",
      title: "Your framing is off",
      description: "The photo is cropped awkwardly. It doesn't look intentional or profile-ready.",
      fix: "Center yourself in the frame with a little space above your head.",
      impactScore: Math.round((55 - metrics.compositionScore) * 1.2),
      evidence: off > 12
        ? `You sit ${off}% off-centre in the frame`
        : `Framing scored ${r(metrics.compositionScore)}/100`,
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
      evidence: `Colour saturation ${r(metrics.saturation)}/100 — natural sits around 45 (${metrics.saturation > 45 ? "yours is over-saturated" : "yours is a bit flat"})`,
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
      evidence: `${metrics.width}×${metrics.height}px — a little low for crisp detail on big screens`,
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
  // Short, chip-sized labels — but specific and flattering, and led by the
  // human signals (a real smile, eye contact) that matter more than any
  // technical metric. Each is gated on the value the engine actually measured,
  // and tiered so a great score reads differently from a merely-good one.
  const signals: string[] = [];
  const p = metrics.presenceDetail;

  // Human signals first — these move people, not megapixels.
  if (p?.genuineSmile) signals.push("Genuine smile");
  if (p?.eyeContact) signals.push("Strong eye contact");
  if (typeof metrics.groomingResult?.overallScore === "number" && metrics.groomingResult.overallScore >= 68) signals.push("Sharp grooming");
  if (typeof metrics.symmetryScore === "number" && metrics.symmetryScore >= 70) signals.push("Balanced features");

  // Technical signals, tiered so "standout" ≠ "clean".
  if (metrics.lightingScore >= 75) signals.push("Standout lighting");
  else if (metrics.lightingScore >= 65) signals.push("Clean, even lighting");
  if (metrics.sharpness >= 75) signals.push("Tack-sharp");
  else if (metrics.sharpness >= 65) signals.push("Sharp & clear");
  if (metrics.compositionScore >= 65) signals.push("Well-framed");
  if (typeof metrics.colorHarmony === "number" && metrics.colorHarmony >= 65) signals.push("Colours suit you");
  else if (metrics.contrast >= 60) signals.push("Punchy contrast");
  if (metrics.resolutionScore >= 75) signals.push("Crisp resolution");

  if (signals.length === 0) {
    signals.push("Room to grow on every signal");
  }

  return signals.slice(0, 5);
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
  const metrics = await analyzeImageDataUrl(audit.imageDataUrl, audit.goal);

  // ponytail: quality gate — reject unusable images before scoring
  if (metrics.qualityGate && !metrics.qualityGate.canProceed) {
    return {
      auditId: audit.id,
      generatedAt: new Date().toISOString(),
      auraScore: null,
      category: "Insufficient Quality",
      oneLineVerdict: metrics.qualityGate.message || "Image quality too low for reliable analysis.",
      statusLeaks: [],
      quickFixes: [{ title: "Retake", description: metrics.qualityGate.message || "Please try again with a better photo.", effort: "Retake required", cost: "Free" }],
      imageMetrics: metrics,
      intelligenceInsights: [],
      goalStrategy: null,
      personalityProfile: null,
      confidence: { overall: 0, perDimension: {} },
      strongestSignals: [],
      budgetUpgradePlan: getBudgetUpgradePlan(audit.budgetRange),
      limitations: [metrics.qualityGate.message || "Image quality insufficient."],
      qualityGate: metrics.qualityGate,
    } as unknown as FreeAuraResult;
  }

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
  const strongestSignals = findStrongestSignals(metrics);
  const statusLeaks = generateStatusLeaks(score, metrics);
  const quickFixes = generateQuickFixes(metrics);
  const topLeak = [...statusLeaks].sort((a, b) => b.impactScore - a.impactScore)[0];
  const oneLineVerdict = composeTeaserVerdict(score, strongestSignals, topLeak);
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
