import type { Audit } from "@/types/audit";
import type { UpgradeBundle } from "@/types/product";
import { getRecommendationsForAudit } from "./getRecommendations";

function getAvoidForNow(audit: Audit): string[] {
  const advice: string[] = [];
  const free = audit.fullReport?.freeResult;
  const full = audit.fullReport?.fullContent;

  const hasLightingIssue = free?.statusLeaks.some((l) => l.category === "lighting") ?? full?.biggestStatusLeaks.some((l) => l.title.toLowerCase().includes("lighting"));
  const hasBackgroundIssue = free?.statusLeaks.some((l) => l.category === "background") ?? full?.biggestStatusLeaks.some((l) => l.title.toLowerCase().includes("background"));
  const hasClarityIssue = free?.statusLeaks.some((l) => l.category === "clarity") ?? full?.biggestStatusLeaks.some((l) => l.title.toLowerCase().includes("clarity"));
  const hasOutfitIssue = free?.statusLeaks.some((l) => l.category === "framing") ?? false;

  if (hasLightingIssue) {
    advice.push("Do not buy another expensive phone before fixing lighting and background.");
  }
  if (hasOutfitIssue || hasClarityIssue) {
    advice.push("Avoid loud accessories if the outfit basics or image clarity is weak.");
  }
  if (hasLightingIssue || hasClarityIssue) {
    advice.push("Avoid heavy filters — focus on improving natural lighting and clarity first.");
  }
  if (hasBackgroundIssue) {
    advice.push("Do not invest in expensive decor before decluttering the visible background.");
  }
  if (audit.budgetRange === 0) {
    advice.push("At zero budget, focus only on free fixes — lighting, lens cleaning, framing, and background.");
  }

  if (advice.length === 0) {
    advice.push("Your presentation is already strong. Consider small targeted upgrades.");
  }

  return advice;
}

function getFreeActions(audit: Audit): string[] {
  const actions: string[] = [];
  const free = audit.fullReport?.freeResult;
  const full = audit.fullReport?.fullContent;

  const hasLighting = free?.statusLeaks.some((l) => l.category === "lighting") ?? full?.biggestStatusLeaks.some((l) => l.title.toLowerCase().includes("lighting"));
  const hasClarity = free?.statusLeaks.some((l) => l.category === "clarity") ?? full?.biggestStatusLeaks.some((l) => l.title.toLowerCase().includes("clarity"));
  const hasBg = free?.statusLeaks.some((l) => l.category === "background") ?? full?.biggestStatusLeaks.some((l) => l.title.toLowerCase().includes("background"));
  const hasFrame = free?.statusLeaks.some((l) => l.category === "framing") ?? full?.biggestStatusLeaks.some((l) => l.title.toLowerCase().includes("frame"));

  if (hasLighting) actions.push("Use natural window light at 45-degree angle");
  if (hasClarity) actions.push("Clean phone camera lens before every shot");
  if (hasBg) actions.push("Declutter visible background — remove objects from frame");
  if (hasFrame) actions.push("Use vertical framing with subject centered and headroom");

  actions.push("Wear a solid neutral-colored top for your next photo");
  if (actions.length > 4) actions.length = 4;

  return actions;
}

export function buildUpgradeBundle(audit: Audit): UpgradeBundle {
  const products = getRecommendationsForAudit(audit, { limit: 5 });

  const totalEstimatedCost = products.reduce((sum, r) => sum + r.product.price, 0);

  const validCount = products.filter((p) => p.priority === "high").length;
  const score = Math.min(
    100,
    Math.max(
      0,
      Math.round(
        (validCount / Math.max(products.length, 1)) * 40 +
          Math.max(0, 30 - totalEstimatedCost / 2000) * 20 +
          (products.length > 0 ? 20 : 0) +
          (audit.budgetRange > 0 ? 10 : 0)
      )
    )
  );

  let expectedUpgradeText = "";
  if (score >= 70) {
    expectedUpgradeText = "High visible upgrade potential within your budget. Prioritize the top recommendations first.";
  } else if (score >= 45) {
    expectedUpgradeText = "Moderate upgrade potential. The free fixes combined with one or two purchases can create noticeable improvement.";
  } else {
    expectedUpgradeText = "Start with the free fixes — lighting, lens cleaning, background declutter. They cost nothing and often make the biggest difference.";
  }

  return {
    budgetRange: audit.budgetRange,
    totalEstimatedCost,
    products,
    freeActions: getFreeActions(audit),
    expectedUpgradeText,
    statusRoiScore: score,
    avoidForNow: getAvoidForNow(audit),
  };
}
