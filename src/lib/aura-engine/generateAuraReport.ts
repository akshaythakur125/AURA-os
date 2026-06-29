import type { Audit, FreeAuraResult, StatusLeak, QuickFix } from "@/types/audit";
import { createLocalId } from "@/types/audit";
import { analyzeImageDataUrl } from "./imageMetrics";
import { calculateAuraScore, determineCategory, generateVerdict } from "./scoring";
import { getBudgetUpgradePlan } from "./budgetPlans";

function generateStatusLeaks(score: number, metrics: import("@/types/audit").ImageSignalMetrics): StatusLeak[] {
  const leaks: StatusLeak[] = [];

  if (metrics.lightingScore < 55) {
    leaks.push({
      id: createLocalId(),
      severity: metrics.lightingScore < 40 ? "high" : "medium",
      category: "lighting",
      title: "Lighting is weakening the frame",
      description: "The image may not create a clean premium first impression because the lighting signal is weak.",
      fix: "Use window light, avoid harsh overhead light, and keep the face or subject facing the light source.",
      impactScore: Math.round((55 - metrics.lightingScore) * 1.2),
    });
  }

  if (metrics.sharpness < 55) {
    leaks.push({
      id: createLocalId(),
      severity: metrics.sharpness < 40 ? "high" : "medium",
      category: "clarity",
      title: "Clarity leak",
      description: "The frame may look less intentional because details are not crisp enough.",
      fix: "Use the rear camera, clean the lens, and avoid shaky low-light shots.",
      impactScore: Math.round((55 - metrics.sharpness) * 1.2),
    });
  }

  if (metrics.backgroundComplexityEstimate > 65) {
    leaks.push({
      id: createLocalId(),
      severity: metrics.backgroundComplexityEstimate > 75 ? "high" : "medium",
      category: "background",
      title: "Busy background",
      description: "The viewer's attention may split between you and the background.",
      fix: "Use a cleaner wall, less cluttered room, or increase distance from background objects.",
      impactScore: Math.round((metrics.backgroundComplexityEstimate - 65) * 1.5),
    });
  }

  if (metrics.compositionScore < 55) {
    leaks.push({
      id: createLocalId(),
      severity: metrics.compositionScore < 40 ? "high" : "medium",
      category: "framing",
      title: "Weak framing",
      description: "The frame may not feel profile-ready or premium because the crop or aspect ratio is not ideal.",
      fix: "Use a cleaner vertical frame with the subject centered and enough headroom.",
      impactScore: Math.round((55 - metrics.compositionScore) * 1.2),
    });
  }

  const satDiff = Math.abs(metrics.saturation - 45);
  if (satDiff > 25) {
    leaks.push({
      id: createLocalId(),
      severity: satDiff > 35 ? "medium" : "low",
      category: "color",
      title: "Color signal mismatch",
      description: "The color balance may make the image look either dull or over-processed.",
      fix: "Use natural light and reduce heavy filters for a more balanced color signal.",
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

export async function generateFreeAuraReport(audit: Audit): Promise<FreeAuraResult> {
  if (!audit.imageDataUrl) {
    throw new Error("No image data available for this audit.");
  }
  const metrics = await analyzeImageDataUrl(audit.imageDataUrl);

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
