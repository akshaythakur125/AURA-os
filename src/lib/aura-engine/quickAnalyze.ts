import { compressImageToDataUrl } from "@/lib/image/processImage";
import { createAudit, updateAudit } from "@/lib/storage/auditStore";
import { generateFreeAuraReport } from "@/lib/aura-engine/generateAuraReport";
import type { AuditType, AuditGoal, BudgetAmount, FreeAuraResult } from "@/types/audit";

export interface QuickResult {
  auditId: string;
  dataUrl: string;
  report: FreeAuraResult;
}

/**
 * Compress → persist a draft audit → run the genuine free analysis. Shared by
 * all the quick tools (Post or Not, Which One, Fit Check, Group…) so every
 * verdict comes from the SAME engine and the audit flows into the paid funnel.
 */
export async function quickAnalyze(
  file: File,
  goal: AuditGoal = "confidence"
): Promise<QuickResult> {
  const compressed = await compressImageToDataUrl(file);
  const audit = createAudit({
    auditType: "photo" as AuditType,
    goal,
    budgetRange: 5000 as BudgetAmount,
  });
  const withImg = updateAudit(audit.id, {
    imageDataUrl: compressed.dataUrl,
    imageMeta: {
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      width: compressed.width,
      height: compressed.height,
      compressedSize: compressed.dataUrl.length,
    },
  });
  const report = await generateFreeAuraReport(
    withImg || { ...audit, imageDataUrl: compressed.dataUrl }
  );
  return { auditId: audit.id, dataUrl: compressed.dataUrl, report };
}
