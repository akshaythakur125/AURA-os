export function generateAuditSpecificCode(auditId: string): string {
  const raw = auditId.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  const suffix = raw.slice(-6);
  return `AURA-${suffix}`;
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

export function validateUnlockCode(inputCode: string, auditId: string): boolean {
  const trimmed = inputCode.trim();
  if (!trimmed) return false;
  if (trimmed === getDemoCode()) return true;
  if (trimmed === generateAuditSpecificCode(auditId)) return true;
  return false;
}
