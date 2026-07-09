import type { FreeAuraResult, FullAuraReport, ImageMetrics } from "@/types";
import type { QuickAuraFixReport } from "@/types/quickFix";

function pickBestLeak(result: FreeAuraResult | FullAuraReport): {
  title: string; explanation: string; fix: string;
} {
  const leaks = "statusLeaks" in result ? result.statusLeaks : "biggestStatusLeaks" in result ? result.biggestStatusLeaks : [];
  if (!leaks || leaks.length === 0) {
    return { title: "Weak first impression", explanation: "Your presentation does not stand out.", fix: "Improve lighting, clarity, and framing." };
  }
  const sorted = [...leaks].sort((a, b) => (b.impactScore || 0) - (a.impactScore || 0));
  const top = sorted[0];
  return { title: top.title, explanation: top.explanation, fix: top.fix || top.explanation };
}

function fixForMetric(metrics: ImageMetrics | undefined): {
  priority: "lighting" | "clarity" | "composition" | "background" | "styling";
  fastestFreeFix: string;
  under500Fix: string;
  under2000Fix: string;
  avoidForNow: string;
  whyItMatters: string;
  expectedShift: string;
} {
  if (!metrics) {
    return {
      priority: "lighting",
      fastestFreeFix: "Use natural window light facing the source",
      under500Fix: "Basic ring light or desk lamp",
      under2000Fix: "Softbox lighting setup",
      avoidForNow: "Do not spend on wardrobe before fixing lighting",
      whyItMatters: "Lighting is the single biggest factor in first-impression quality",
      expectedShift: "Clearer face features and warmer presentation",
    };
  }

  const worst = Math.min(metrics.lightingScore, metrics.clarityScore, metrics.compositionScore);
  const weakest = worst === metrics.lightingScore ? "lighting"
    : worst === metrics.clarityScore ? "clarity"
    : "composition";

  if (weakest === "lighting") {
    return {
      priority: "lighting",
      fastestFreeFix: "Retake the photo near window light, facing the light source",
      under500Fix: "Use a small ring light or desk lamp",
      under2000Fix: "Use a softbox or studio light setup",
      avoidForNow: "Do not buy expensive accessories before fixing lighting",
      whyItMatters: "Lighting is the single biggest factor in first-impression quality",
      expectedShift: "Warmer, clearer facial features",
    };
  }
  if (weakest === "clarity") {
    return {
      priority: "clarity",
      fastestFreeFix: "Clean lens, use rear camera, hold steady",
      under500Fix: "Phone stand or lens cloth",
      under2000Fix: "Basic tripod with phone mount",
      avoidForNow: "Do not overedit a blurry photo",
      whyItMatters: "Blurry or low-resolution images signal low effort",
      expectedShift: "Sharper, more polished look",
    };
  }
  if (weakest === "composition") {
    return {
      priority: "composition",
      fastestFreeFix: "Use vertical 4:5 framing with face/body centered",
      under500Fix: "Tripod or phone support for consistent framing",
      under2000Fix: "Basic tripod + clean background setup",
      avoidForNow: "Do not crop randomly or use cluttered mirror selfies",
      whyItMatters: "Framing controls where the viewer's eye goes first",
      expectedShift: "More intentional, confident visual structure",
    };
  }

  return {
    priority: "background",
    fastestFreeFix: "Use a plain wall or declutter the frame",
    under500Fix: "Use a neutral cloth or plain background",
    under2000Fix: "Simple lamp + clean background setup",
    avoidForNow: "Do not buy more visible status props",
    whyItMatters: "A distracting background undermines your presence",
    expectedShift: "Cleaner, more focused presentation",
  };
}

function buildThreeStepPlan(priority: string, freeResult?: FreeAuraResult): string[] {
  if (freeResult?.quickFixes && freeResult.quickFixes.length >= 3) {
    return freeResult.quickFixes.slice(0, 3);
  }
  const plans: Record<string, string[]> = {
    lighting: ["Move to natural window light", "Face the light source directly", "Retake and compare"],
    clarity: ["Clean your camera lens", "Use rear camera, tap to focus", "Hold steady or use support"],
    composition: ["Frame vertically 4:5", "Keep face centered", "Remove clutter from background"],
    background: ["Find a plain wall", "Declutter visible area", "Shoot at eye level"],
    styling: ["Wear solid colors without large logos", "Keep hair tidy and face visible", "Use minimal accessories"],
  };
  return plans[priority] || plans.lighting;
}

export function generateQuickAuraFix(
  auditId: string,
  freeResult?: FreeAuraResult,
  fullReport?: FullAuraReport,
  imageMetrics?: ImageMetrics,
): QuickAuraFixReport {
  const source = fullReport || freeResult;
  const metrics = fullReport ? undefined : imageMetrics || freeResult?.imageMetrics;
  const leak = source ? pickBestLeak(source) : { title: "Weak first impression", explanation: "Your presentation does not stand out.", fix: "Improve lighting, clarity, and framing." };
  const fixInfo = fixForMetric(metrics);
  const threeStepActionPlan = buildThreeStepPlan(fixInfo.priority, freeResult);

  const quickFixScore = source
    ? ("fullScore" in source ? source.fullScore : "auraScore" in source ? source.auraScore : 65)
    : 65;

  return {
    quickFixScore: Math.round(quickFixScore),
    biggestLeak: leak.title,
    leakExplanation: leak.explanation,
    whyItMatters: fixInfo.whyItMatters,
    fastestFreeFix: fixInfo.fastestFreeFix,
    under500Fix: fixInfo.under500Fix,
    under2000Fix: fixInfo.under2000Fix,
    avoidForNow: fixInfo.avoidForNow,
    threeStepActionPlan,
    expectedPresentationShift: fixInfo.expectedShift,
    upgradePriority: fixInfo.priority,
    finalOneLineAdvice: `Fix your biggest status leak: ${leak.title.toLowerCase()}. ${freeResult ? freeResult.oneLineVerdict : "Start with lighting and clarity."}`,
    generatedAt: new Date().toISOString(),
  };
}
