import type { ProductType } from "@/types";
import { getAudits } from "@/lib/storage/auditStore";

export function getBestAuditForUpsell(productType: ProductType): { auditId: string; auditType: string } | null {
  if (typeof window === "undefined") return null;
  const audits = getAudits();
  if (audits.length === 0) return null;

  let preferred: (typeof audits)[number] | null = null;

  if (productType === "aura_report") {
    preferred = audits.find((a) => a.auditType === "photo" && a.freeScore !== undefined) ?? null;
  } else if (productType === "dating_audit") {
    preferred = audits.find((a) => a.auditType === "dating" || a.auditType === "instagram") ?? null;
  } else if (productType === "glowup_plan") {
    preferred = audits.find((a) => a.freeScore !== undefined && a.glowupPlan !== undefined) ?? null;
  }

  if (!preferred) {
    preferred = audits[0];
  }

  return { auditId: preferred.id, auditType: preferred.auditType };
}
