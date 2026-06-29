import type { Audit } from "@/types/audit";
import type { Product, RecommendedProduct, StatusLeakTag, GoalTag, AuditTypeTag } from "@/types/product";
import { PRODUCTS } from "@/config/products";

function getStatusLeakTags(audit: Audit): StatusLeakTag[] {
  const tags: StatusLeakTag[] = [];
  const free = audit.fullReport?.freeResult;
  const full = audit.fullReport?.fullContent;

  if (full) {
    for (const leak of full.biggestStatusLeaks) {
      const category = leak.title.toLowerCase();
      if (category.includes("lighting")) tags.push("lighting");
      if (category.includes("clarity") || category.includes("sharp")) tags.push("clarity");
      if (category.includes("background") || category.includes("busy")) tags.push("background");
      if (category.includes("frame") || category.includes("compos")) tags.push("framing");
      if (category.includes("color") || category.includes("satur")) tags.push("color");
      if (category.includes("groom")) tags.push("grooming");
    }
  } else if (free) {
    for (const leak of free.statusLeaks) {
      const cat = leak.category;
      if (cat === "lighting") tags.push("lighting");
      if (cat === "clarity") tags.push("clarity");
      if (cat === "background") tags.push("background");
      if (cat === "framing") tags.push("framing");
      if (cat === "color") tags.push("color");
      if (cat === "resolution") tags.push("resolution");
    }
  }

  switch (audit.auditType) {
    case "outfit": tags.push("outfit_fit"); break;
    case "room": tags.push("room_clutter"); break;
  }
  switch (audit.goal) {
    case "dating": tags.push("grooming"); break;
    case "glowup": tags.push("grooming"); break;
  }

  return [...new Set(tags)];
}

function matchProduct(
  product: Product,
  leakTags: StatusLeakTag[],
  goal: string,
  auditType: string,
  budget: number
): { score: number; reason: string; linkedLeak: string; impact: string; priority: "high" | "medium" | "low" } {
  let score = 0;
  let bestLeak = "general improvement";
  let reason = "Recommended upgrade";

  const budgetOk = product.budgetTags.some((b) => b <= budget || b === 0);
  if (!budgetOk) {
    return { score: 0, reason: "Outside budget", linkedLeak: "", impact: "", priority: "low" };
  }

  for (const tag of leakTags) {
    if (product.statusLeakTags.includes(tag)) {
      score += 35;
      bestLeak = tag;
    }
  }

  if (product.goalTags.includes(goal as GoalTag)) score += 20;
  if (product.auditTypeTags.includes(auditType as AuditTypeTag)) score += 15;
  if (product.isSponsored) score += 0; // no auto boost

  score += Math.min(product.priorityScore * 0.2, 15);
  score += Math.max(0, 30 - product.price / 200);

  score = Math.min(100, Math.max(0, Math.round(score)));
  const priority = score >= 60 ? "high" : score >= 35 ? "medium" : "low";

  const leakLabel = bestLeak.charAt(0).toUpperCase() + bestLeak.slice(1).replace("_", " ");
  reason = `Targets your ${leakLabel.toLowerCase()} signal`;
  const impact = product.visualSignalImproved;

  return { score, reason, linkedLeak: leakLabel, impact, priority };
}

export function getRecommendationsForAudit(
  audit: Audit,
  options?: { limit?: number }
): RecommendedProduct[] {
  const limit = options?.limit ?? 6;
  const leakTags = getStatusLeakTags(audit);
  const matched: RecommendedProduct[] = [];

  for (const product of PRODUCTS) {
    if (!product.isActive) continue;
    const result = matchProduct(
      product,
      leakTags,
      audit.goal,
      audit.auditType,
      audit.budgetRange
    );
    if (result.score <= 0) continue;

    matched.push({
      product,
      matchScore: result.score,
      reason: result.reason,
      linkedStatusLeak: result.linkedLeak,
      estimatedImpact: result.impact,
      priority: result.priority,
    });
  }

  matched.sort((a, b) => b.matchScore - a.matchScore);
  return matched.slice(0, limit);
}
