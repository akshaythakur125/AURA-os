import type { Audit, ProductType, StatusLeak } from "@/types";
import { isProductUnlocked as checkUnlocked } from "@/lib/storage/unlockStore";

export const AUDIT_TYPE_LABELS: Record<string, string> = {
  photo: "Photo Aura Check",
  instagram: "Instagram Profile Audit",
  dating: "Dating Profile Audit",
  outfit: "Outfit Audit",
  background: "Room / Background Audit",
};

export const GOAL_LABELS: Record<string, string> = {
  dating: "Dating",
  instagram: "Instagram",
  college: "College",
  office: "Office",
  glowup: "General Glow-Up",
};

export const BUDGET_LABELS: Record<string, string> = {
  "0": "₹0 — Free only",
  "2000": "₹2,000",
  "5000": "₹5,000",
  "10000": "₹10,000",
  "25000": "₹25,000+",
};

export const PRODUCT_LABELS: Record<ProductType, string> = {
  aura_report: "Full Aura Report",
  dating_audit: "Dating/Profile Audit",
  glowup_plan: "30-Day Glow-Up Plan",
};

export const PRODUCT_PRICES: Record<ProductType, number> = {
  aura_report: 99,
  dating_audit: 299,
  glowup_plan: 499,
};

export function getAuditScore(audit: Audit): number | undefined {
  return audit.fullScore ?? audit.freeScore;
}

export function getAuditCategory(audit: Audit): string {
  if (audit.fullReport?.category) return audit.fullReport.category;
  if (audit.freeResult?.category) return audit.freeResult.category;
  return "Not analyzed";
}

export function isProductUnlocked(audit: Audit, product: ProductType): boolean {
  return audit.unlockedProducts?.includes(product) ?? checkUnlocked(audit.id, product);
}

export function getAuditDisplayTitle(audit: Audit): string {
  if (audit.fullReport?.category) return `${AUDIT_TYPE_LABELS[audit.auditType] || audit.auditType} — ${audit.fullReport.category}`;
  if (audit.freeResult?.oneLineVerdict) return audit.freeResult.oneLineVerdict;
  return AUDIT_TYPE_LABELS[audit.auditType] || audit.auditType;
}

export function getAuditBiggestLeak(audit: Audit): StatusLeak | undefined {
  if (audit.fullReport?.biggestStatusLeaks?.[0]) {
    return audit.fullReport.biggestStatusLeaks[0];
  }
  if (audit.freeResult?.statusLeaks?.[0]) {
    const leak = audit.freeResult.statusLeaks[0];
    return {
      title: leak.title,
      explanation: leak.explanation,
      fix: leak.fix,
      severity: leak.severity,
      impactScore: leak.impactScore,
    };
  }
  return undefined;
}

export function formatBudgetRange(range: string): string {
  return BUDGET_LABELS[range] || range;
}

export function formatAuditType(type: string): string {
  return AUDIT_TYPE_LABELS[type] || type;
}

export function formatGoal(goal: string): string {
  return GOAL_LABELS[goal] || goal;
}

export function formatProductType(product: ProductType): string {
  return PRODUCT_LABELS[product] || product;
}
