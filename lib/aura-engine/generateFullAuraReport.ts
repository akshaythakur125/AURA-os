import type { FreeAuraResult, FullAuraReport, VisualBreakdown, BiggestStatusLeak, PriorityUpgradeMap, BudgetUpgradePlan, PhotoGuidance, Audit } from "@/types";
import { extractImageMetrics } from "@/lib/aura-engine/imageMetrics";
import { computeAuraScore, getCategory, getVerdict, getStrongestSignals, generateStatusLeaks } from "@/lib/aura-engine/scoring";
import { getBudgetPlans } from "@/lib/aura-engine/budgetPlans";


function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

export async function generateFullAuraReport(
  imageDataUrl: string,
  existingFreeResult?: FreeAuraResult | null,
  audit?: Audit | null
): Promise<FullAuraReport> {
  let freeResult: FreeAuraResult;

  if (existingFreeResult) {
    freeResult = existingFreeResult;
  } else {
    const metrics = await extractImageMetrics(imageDataUrl);
    const score = computeAuraScore(metrics);
    freeResult = {
      auraScore: score,
      category: getCategory(score),
      oneLineVerdict: getVerdict(score, metrics),
      strongestSignals: getStrongestSignals(metrics),
      statusLeaks: generateStatusLeaks(metrics),
      quickFixes: [],
      budgetUpgradePlan: getBudgetPlans("0"),
      imageMetrics: metrics,
      generatedAt: new Date().toISOString(),
    };
  }

  const m = freeResult.imageMetrics;
  const fullScore = clamp(freeResult.auraScore + Math.round(Math.random() * 4 + 1), 35, 95);

  const visualBreakdown: VisualBreakdown = {
    lighting: m.lightingScore,
    clarity: m.clarityScore,
    composition: m.compositionScore,
    backgroundControl: clamp(100 - m.backgroundComplexityEstimate, 0, 100),
    colorSignal: clamp(m.saturation * 0.5 + m.contrast * 0.5, 0, 100),
    premiumSignal: clamp(m.lightingScore * 0.3 + m.clarityScore * 0.3 + m.compositionScore * 0.2 + m.overallImageQualityScore * 0.2, 0, 100),
    overallConsistency: clamp((m.lightingScore + m.clarityScore + m.compositionScore + (100 - m.backgroundComplexityEstimate)) / 4, 0, 100),
  };

  const biggestStatusLeaks: BiggestStatusLeak[] = freeResult.statusLeaks.slice(0, 4).map((l) => {
    let cost = "₹0";
    if (l.title.toLowerCase().includes("lighting")) cost = "₹0–₹2,000";
    else if (l.title.toLowerCase().includes("clarity")) cost = "₹0";
    else if (l.title.toLowerCase().includes("background")) cost = "₹0–₹1,000";
    else if (l.title.toLowerCase().includes("framing")) cost = "₹0";
    else if (l.title.toLowerCase().includes("saturation") || l.title.toLowerCase().includes("contrast")) cost = "₹0";
    return { ...l, estimatedCost: cost };
  });

  const weakLighting = m.lightingScore < 55;
  const weakClarity = m.clarityScore < 55;
  const weakComposition = m.compositionScore < 55;
  const busyBackground = m.backgroundComplexityEstimate > 70;
  const weakColor = m.saturation < 30 || m.contrast < 35;

  let firstPriority = "Improve lighting — face natural light and avoid harsh overhead sources";
  let secondPriority = "Clear clutter from background and use a clean wall";
  let avoidForNow = "Expensive accessories before fixing lighting and background";

  if (weakLighting) {
    firstPriority = "Improve lighting — face natural window light or use a diffused ring light";
    if (busyBackground) {
      secondPriority = "Clean the background — remove clutter or move to a plain wall";
    } else if (weakClarity) {
      secondPriority = "Sharpen image quality — use rear camera, clean lens, stabilize frame";
    } else {
      secondPriority = "Reframe the shot — vertical crop with centered subject";
    }
    avoidForNow = "Expensive accessories — fix lighting first for maximum impact per rupee";
  } else if (busyBackground) {
    firstPriority = "Clean the background — it is the biggest distraction in the frame";
    if (weakComposition) {
      secondPriority = "Improve framing — vertical aspect ratio with better subject positioning";
    } else {
      secondPriority = "Upgrade grooming and outfit for better overall signal";
    }
    avoidForNow = "More visible status props — a cluttered background weakens every other signal";
  } else if (weakClarity) {
    firstPriority = "Improve image sharpness — rear camera, clean lens, avoid shaky low-light shots";
    secondPriority = "Better lighting — clarity and lighting together define perceived quality";
    avoidForNow = "Premium wardrobe upgrades — clarity and lighting matter more than brand tags";
  } else if (weakComposition) {
    firstPriority = "Fix framing — vertical crop, subject centered, sufficient headroom";
    secondPriority = "Improve background simplicity — let the subject breathe";
    avoidForNow = "Accessory upgrades — weak framing reduces the impact of every detail";
  } else if (weakColor) {
    firstPriority = "Improve color signal — shoot in natural light and avoid heavy filters";
    secondPriority = "Ensure contrast in outfit against background";
    avoidForNow = "Expensive wardrobe — color balance and contrast cost nothing to fix";
  }

  const priorityUpgradeMap: PriorityUpgradeMap = {
    firstPriority,
    secondPriority,
    avoidForNow,
  };

  const budgetUpgradePlan: BudgetUpgradePlan = {
    immediateFree: [
      "Retake photo in natural window light",
      "Clear background clutter or move to plain wall",
      "Clean phone lens before shooting",
      "Reframe — vertical crop, centered subject",
      "Remove heavy filters and restore natural color",
    ],
    under2000: [
      "Basic grooming (haircut, nails, skin)",
      "Solid-color neutral t-shirt or shirt",
      "Phone tripod or clip-on ring light",
      "Clean phone case or go minimalist",
    ],
    under5000: [
      "Well-fitted overshirt or light jacket",
      "Minimal sneakers or clean shoes",
      "Simple watch or accessory",
      "Photo setup upgrade (better backdrop, lighting)",
    ],
    under10000: [
      "Complete outfit set (shirt, pants, shoes)",
      "Dedicated photo session or quality self-portrait setup",
      "Room corner upgrade — clean wall, good light area",
      "Skincare and grooming kit",
    ],
    under25000: [
      "Wardrobe capsule (3-4 coordinated outfits)",
      "Professional profile shoot",
      "Premium grooming (salon, skincare, styling)",
      "Full profile refresh across platforms",
    ],
  };

  const photoGuidance: PhotoGuidance = {
    lighting: "Always face the main light source. Window light is best. Avoid overhead ceiling lights and mixed color temperatures.",
    framing: "Use a vertical 4:5 or 9:16 crop for profile photos. Keep the subject centered with the eyes in the upper third of the frame.",
    background: "Choose plain walls, clean corners, or uncluttered indoor spaces. Avoid busy patterns, random objects, or dirty mirrors.",
    presentation: "Wear solid colors that contrast with the background. Avoid large logos or text. Grooming should be intentional, not overdone.",
    editing: "Avoid heavy filters or face tuning. Subtle brightness and contrast adjustments are fine. Natural skin texture signals confidence.",
  };

  let detailedVerdict = freeResult.oneLineVerdict;
  if (freeResult.statusLeaks.length > 0) {
    detailedVerdict += ` Your most significant area is "${freeResult.statusLeaks[0].title}". Details below show exactly what to fix and in what order.`;
  }
  if (audit?.personalization) {
    detailedVerdict += ` Your status archetype is "${audit.personalization.archetype}". ${audit.personalization.archetypeExplanation}`;
  }

  let finalVerdict = `Your Full Aura Score of ${fullScore}/100 places you in the "${freeResult.category}" category. ${
    fullScore >= 70
      ? "Your visual presentation is generally strong. Focus on small refinements and consistency across all photos."
      : fullScore >= 50
        ? "You have a solid foundation. Addressing the priority areas above will noticeably improve your first impression."
        : "Small targeted changes can significantly improve your visual signal. Start with the highest-priority fix listed above."
  }`;
  if (audit?.personalization) {
    finalVerdict += ` Your priority is: ${audit.personalization.userPriority}.`;
  }
  finalVerdict += ` AuraCheck analyzes presentation signals, not human worth. This report is guidance based on local browser-based analysis.`;

  return {
    fullScore,
    category: freeResult.category,
    detailedVerdict,
    visualBreakdown,
    strongestSignals: freeResult.strongestSignals,
    biggestStatusLeaks,
    priorityUpgradeMap,
    budgetUpgradePlan,
    photoGuidance,
    finalVerdict,
    generatedAt: new Date().toISOString(),
  };
}
