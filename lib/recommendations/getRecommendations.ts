import type { Audit, StatusLeak } from "@/types";
import type { Product, RecommendedProduct } from "@/types/product";
import { PRODUCTS } from "@/config/products";

const BUDGET_MAX: Record<string, number> = {
  "0": 0,
  "2000": 2000,
  "5000": 5000,
  "10000": 10000,
  "25000": 999999,
};

const BUDGET_PRIORITY: Record<string, number> = {
  "0": 10,
  "2000": 8,
  "5000": 6,
  "10000": 4,
  "25000": 2,
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

function getLeakKeywords(leaks: StatusLeak[]): string[] {
  const keywords: string[] = [];
  for (const leak of leaks) {
    const lower = leak.title.toLowerCase() + " " + leak.explanation.toLowerCase();
    if (lower.includes("lighting") || lower.includes("light")) keywords.push("lighting");
    if (lower.includes("clarity") || lower.includes("sharp") || lower.includes("blur")) keywords.push("clarity");
    if (lower.includes("background") || lower.includes("clutter") || lower.includes("busy")) keywords.push("background");
    if (lower.includes("framing") || lower.includes("crop") || lower.includes("composition")) keywords.push("framing");
    if (lower.includes("saturation") || lower.includes("color") || lower.includes("dull")) keywords.push("color");
    if (lower.includes("contrast") || lower.includes("wash")) keywords.push("contrast");
    if (lower.includes("grooming") || lower.includes("outfit")) keywords.push("grooming", "outfit");
  }
  return [...new Set(keywords)];
}

function scoreProductForAudit(
  product: Product,
  audit: Audit,
  leakKeywords: string[],
  leaks: StatusLeak[]
): { score: number; reason: string; linkedStatusLeak: string; estimatedImpact: string; priority: "high" | "medium" | "low" } {
  let score = 0;
  let reason = "";
  let linkedStatusLeak = "";
  let estimatedImpact = "";
  let priority: "high" | "medium" | "low" = "low";

  const budgetMax = BUDGET_MAX[audit.budgetRange] ?? 0;
  if (product.price > budgetMax && audit.budgetRange !== "25000") {
    return { score: -1, reason: "", linkedStatusLeak: "", estimatedImpact: "", priority: "low" };
  }

  if (audit.budgetRange === "0" && product.price > 0) {
    return { score: -1, reason: "", linkedStatusLeak: "", estimatedImpact: "", priority: "low" };
  }

  const statusLeakMatch = product.statusLeakTags.filter((t) => leakKeywords.includes(t)).length;
  score += statusLeakMatch * 25;
  if (statusLeakMatch > 0 && leaks.length > 0) {
    linkedStatusLeak = leaks[0].title;
    estimatedImpact = `Directly addresses "${leaks[0].title}"`;
    priority = statusLeakMatch >= 2 ? "high" : "medium";
  }

  const goalMatch = product.goalTags.filter((g) => g === audit.goal).length;
  score += goalMatch * 20;
  if (goalMatch > 0 && !linkedStatusLeak) {
    linkedStatusLeak = "Goal-aligned upgrade";
    estimatedImpact = `Supports your "${audit.goal}" goal`;
    priority = "medium";
  }

  const auditMatch = product.auditTypeTags.filter((t) => t === audit.auditType).length;
  score += auditMatch * 15;

  score += product.priorityScore * 0.3;
  score -= BUDGET_PRIORITY[audit.budgetRange] ?? 0;

  if (product.isSponsored) {
    score *= 0.9;
  }

  if (score <= 0) {
    return { score: -1, reason: "", linkedStatusLeak: "", estimatedImpact: "", priority: "low" };
  }

  if (!reason) {
    if (statusLeakMatch >= 2) {
      reason = `Targets your biggest status leaks in ${product.statusLeakTags.join(" and ")}`;
    } else if (statusLeakMatch >= 1) {
      reason = `Helps fix "${leakKeywords[0]}" status leak`;
    } else if (goalMatch > 0) {
      reason = `Recommended for your "${audit.goal}" goal`;
    } else {
      reason = "General upgrade for visual presentation";
    }
  }

  if (!estimatedImpact) {
    estimatedImpact = product.whyItWorks.slice(0, 80);
  }

  return { score, reason, linkedStatusLeak, estimatedImpact, priority };
}

export function getRecommendationsForAudit(
  audit: Audit,
  options?: { limit?: number }
): RecommendedProduct[] {
  const limit = options?.limit ?? 10;
  const leaks = getLeaksFromAudit(audit);
  const leakKeywords = getLeakKeywords(leaks);

  const scored = PRODUCTS.filter((p) => p.isActive)
    .map((product) => {
      const result = scoreProductForAudit(product, audit, leakKeywords, leaks);
      return { product, ...result } as RecommendedProduct & { score: number };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return scored.map(({ product, score, reason, linkedStatusLeak, estimatedImpact, priority }) => ({
    product,
    matchScore: Math.round(score),
    reason,
    linkedStatusLeak,
    estimatedImpact,
    priority,
  }));
}

export function getFreeActions(): Product[] {
  return PRODUCTS.filter((p) => p.price === 0 && p.isActive);
}
