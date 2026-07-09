import type { Audit, StatusLeak } from "@/types";
import type { UpgradeBundle } from "@/types/product";
import { PRODUCTS } from "@/config/products";
import { getRecommendationsForAudit } from "@/lib/recommendations/getRecommendations";

const BUDGET_MAX: Record<string, number> = {
  "0": 0,
  "2000": 2000,
  "5000": 5000,
  "10000": 10000,
  "25000": 999999,
};

function getLeaksFromAudit(audit: Audit): StatusLeak[] {
  if (audit.fullReport?.biggestStatusLeaks) {
    return audit.fullReport.biggestStatusLeaks.map((l) => ({
      title: l.title,
      explanation: l.explanation,
      fix: l.fix,
      severity: l.severity,
      impactScore: l.impactScore,
    }));
  }
  if (audit.freeResult?.statusLeaks) {
    return audit.freeResult.statusLeaks;
  }
  return [];
}

function generateAvoidForNow(leaks: StatusLeak[], budgetRange: string): string[] {
  const advice: string[] = [];
  const lowerTitles = leaks.map((l) => l.title.toLowerCase());

  if (lowerTitles.some((t) => t.includes("lighting"))) {
    advice.push("Do not buy an expensive phone or camera before fixing lighting — better lighting on a basic phone beats bad lighting on a flagship.");
    advice.push("Avoid expensive accessories before fixing lighting — lighting is the highest-ROI fix per rupee.");
  }
  if (lowerTitles.some((t) => t.includes("background") || t.includes("clutter"))) {
    advice.push("Avoid branded items or visible status props before cleaning the background — clutter weakens every other signal.");
    advice.push("Do not buy a new outfit before fixing your background — even premium outfits look cheap against a messy wall.");
  }
  if (lowerTitles.some((t) => t.includes("clarity") || t.includes("sharp"))) {
    advice.push("Avoid heavy filters if clarity and lighting are low — filters amplify noise and make the image look worse.");
    advice.push("Do not invest in premium wardrobe before fixing image sharpness — blurry photos hide all details.");
  }
  if (lowerTitles.some((t) => t.includes("framing") || t.includes("crop") || t.includes("composition"))) {
    advice.push("Avoid profile-worthy accessories before fixing framing — bad crop reduces the impact of everything in frame.");
  }
  if (lowerTitles.some((t) => t.includes("color") || t.includes("saturation"))) {
    advice.push("Avoid heavy editing apps before fixing natural lighting — natural color always looks better than artificial saturation.");
  }

  if (budgetRange === "0") {
    advice.push("Do not spend money before using free fixes — lighting, framing, and background can all be improved at ₹0 cost.");
  }

  if (advice.length === 0) {
    advice.push("Your image signals are generally strong. Focus on consistency and subtle refinements before making any big purchase.");
  }

  return advice.slice(0, 3);
}

function generateExpectedUpgradeText(leaks: StatusLeak[], budgetRange: string, productCount: number): string {
  const severityMap = { high: 3, medium: 2, low: 1 };
  const totalSeverity = leaks.reduce((sum, l) => sum + (severityMap[l.severity] ?? 1), 0);

  if (budgetRange === "0") {
    return "All recommendations are free actions you can take right now. No purchase needed.";
  }
  if (productCount === 0) {
    return "No paid recommendations match your current budget. Focus on free actions listed below.";
  }

  const highLeaks = leaks.filter((l) => l.severity === "high");
  if (highLeaks.length >= 2) {
    return "Targeting your highest-severity status leaks first. Expect noticeable improvement in first impression with consistent effort.";
  }

  if (totalSeverity >= 5) {
    return "Bundled recommendations address multiple signal gaps. Expected upgrade: noticeable improvement in overall visual presentation.";
  }

  return "Focused upgrades for your specific signal gaps. Small consistent improvements compound over time.";
}

function computeRoiScore(leaks: StatusLeak[]): number {
  const severityScores = leaks.map((l) => (l.severity === "high" ? 30 : l.severity === "medium" ? 20 : 10));
  const base = severityScores.reduce((a, b) => a + b, 0);
  return Math.min(100, base);
}

export function buildUpgradeBundle(audit: Audit): UpgradeBundle {
  const budgetMax = BUDGET_MAX[audit.budgetRange] ?? 0;
  const leaks = getLeaksFromAudit(audit);

  let recommendations = getRecommendationsForAudit(audit, { limit: 20 })
    .filter((r) => r.product.price <= budgetMax);

  if (audit.budgetRange !== "25000") {
    recommendations = recommendations.filter((r) => r.product.price <= budgetMax);
  }

  let totalCost = 0;
  const bundleProducts: typeof recommendations = [];

  for (const rec of recommendations) {
    if (rec.product.price === 0) continue;
    if (totalCost + rec.product.price <= budgetMax || budgetMax >= 999999) {
      bundleProducts.push(rec);
      totalCost += rec.product.price;
    }
  }

  if (audit.budgetRange === "0") {
    const allFree = recommendations.filter((r) => r.product.price === 0);
    bundleProducts.push(...allFree);
  }

  const freeActions = PRODUCTS.filter((p) => p.price === 0 && p.isActive).map((p) => p.title);
  const freeFromAudit = leaks.map((l) => l.fix);
  const allFreeActions = [...new Set([...freeActions, ...freeFromAudit])].slice(0, 6);

  const avoidForNow = generateAvoidForNow(leaks, audit.budgetRange);
  const expectedUpgradeText = generateExpectedUpgradeText(leaks, audit.budgetRange, bundleProducts.length);
  const statusRoiScore = computeRoiScore(leaks);

  return {
    budgetRange: audit.budgetRange,
    totalEstimatedCost: totalCost,
    products: bundleProducts,
    freeActions: allFreeActions,
    expectedUpgradeText,
    statusRoiScore,
    avoidForNow,
  };
}
