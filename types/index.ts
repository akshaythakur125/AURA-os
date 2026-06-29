export type AuditType =
  | "photo"
  | "instagram"
  | "dating"
  | "outfit"
  | "background";

export type Goal =
  | "dating"
  | "instagram"
  | "college"
  | "office"
  | "glowup";

export type BudgetRange = "0" | "2000" | "5000" | "10000" | "25000";

export interface ImageMeta {
  fileName: string;
  fileType: string;
  fileSize: number;
  compressedSize: number;
  width: number;
  height: number;
}

export type ReportStatus = "draft" | "free_score" | "full_report";

export interface Audit {
  id: string;
  auditType: AuditType;
  goal: Goal;
  budgetRange: BudgetRange;
  imageDataUrl: string;
  imageMeta: ImageMeta;
  reportStatus: ReportStatus;
  createdAt: string;
  updatedAt: string;
}

export interface UserPreferences {
  displayName?: string;
  city?: string;
}
