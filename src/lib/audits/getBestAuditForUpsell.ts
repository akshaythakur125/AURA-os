import type { Audit } from "@/types/audit";
import type { ProductType } from "@/types/payment";
import { getAudits } from "@/lib/storage/auditStore";

export function getBestAuditForUpsell(
  productType: ProductType
): Audit | null {
  if (typeof window === "undefined") return null;
  const audits = getAudits().filter((a) => a.reportStatus !== "draft");
  if (audits.length === 0) return null;

  if (productType === "dating_audit") {
    const datingAudits = audits.filter(
      (a) => a.auditType === "dating" || a.auditType === "instagram"
    );
    const unscored = datingAudits.filter(
      (a) => a.freeScore !== undefined && !a.unlockedProducts?.includes("dating_audit")
    );
    if (unscored.length > 0) return unscored[0];
    const scored = datingAudits.filter(
      (a) => a.freeScore !== undefined
    );
    if (scored.length > 0) return scored[0];
    return datingAudits[0] || null;
  }

  if (productType === "glowup_plan") {
    const unscored = audits.filter(
      (a) =>
        a.freeScore !== undefined &&
        !a.unlockedProducts?.includes("glowup_plan")
    );
    if (unscored.length > 0) return unscored[0];
    const scored = audits.filter((a) => a.freeScore !== undefined);
    if (scored.length > 0) return scored[0];
    return audits[0] || null;
  }

  const unscored = audits.filter(
    (a) =>
      a.freeScore !== undefined &&
      !a.unlockedProducts?.includes("aura_report")
  );
  if (unscored.length > 0) return unscored[0];
  const scored = audits.filter((a) => a.freeScore !== undefined);
  if (scored.length > 0) return scored[0];
  return audits[0] || null;
}
