import type { ProductType } from "@/types";

export function getProductPrefix(product: ProductType): string {
  switch (product) {
    case "dating_audit": return "DATE";
    case "glowup_plan": return "GLOW";
    default: return "AURA";
  }
}

export function generateUnlockCode(auditId: string, product: ProductType): string {
  const raw = auditId.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  const suffix = raw.slice(-6);
  const prefix = getProductPrefix(product);
  return `${prefix}-${suffix}`;
}

export function normalizeUnlockCode(code: string): string {
  return code.trim().toUpperCase();
}
