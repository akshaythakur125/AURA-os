export type ProductCodeType = "quick_fix" | "aura_report" | "dating_audit" | "glowup_plan";

export function generateAuditSpecificCode(auditId: string, product: ProductCodeType = "aura_report"): string {
  const raw = auditId.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  const suffix = raw.slice(-6);
  const prefix = product === "quick_fix" ? "FIX" : product === "dating_audit" ? "DATE" : product === "glowup_plan" ? "GLOW" : "AURA";
  return `${prefix}-${suffix}`;
}

export function getDemoCode(): string {
  if (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_DEMO_UNLOCK_CODE) {
    return process.env.NEXT_PUBLIC_DEMO_UNLOCK_CODE;
  }
  return "AURADEMO";
}

export function getUpiiId(): string {
  if (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_MANUAL_UPI_ID) {
    return process.env.NEXT_PUBLIC_MANUAL_UPI_ID;
  }
  return "your-upi-id@upi";
}

export function validateUnlockCode(inputCode: string, auditId: string, product: ProductCodeType = "aura_report"): boolean {
  const trimmed = inputCode.trim();
  if (!trimmed) return false;
  if (trimmed === getDemoCode()) return true;
  if (trimmed === generateAuditSpecificCode(auditId, product)) return true;
  return false;
}
