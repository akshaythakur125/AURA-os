export type AuditType = "photo" | "instagram" | "dating" | "outfit" | "room";

export type AuditGoal = "dating" | "instagram" | "college" | "office" | "glowup";

export type BudgetAmount = 0 | 2000 | 5000 | 10000 | 25000;

export interface BudgetRange {
  min: BudgetAmount;
  max: BudgetAmount;
  currency: "INR";
}

export type AuraReportStatus =
  | "draft"
  | "free_generated"
  | "locked"
  | "unlocked";

export type UnlockStatus = "free" | "locked" | "unlocked";

export interface ImageMeta {
  fileName: string;
  fileType: string;
  fileSize: number;
  width?: number;
  height?: number;
  compressedSize?: number;
}

export interface Audit {
  id: string;
  auditType: AuditType;
  goal: AuditGoal;
  budgetRange: BudgetAmount;
  imageDataUrl?: string;
  imageMeta?: ImageMeta;
  freeScore?: number;
  fullScore?: number;
  freeSummary?: string;
  fullReport?: AuraReport;
  reportStatus: AuraReportStatus;
  unlockStatus: UnlockStatus;
  createdAt: string;
  updatedAt: string;
}

export interface AuraScore {
  overall: number;
  categories: {
    visual: number;
    presentation: number;
    signals: number;
    cohesion: number;
  };
}

export interface StatusLeak {
  id: string;
  severity: "low" | "medium" | "high";
  category: string;
  title: string;
  description: string;
  impact: string;
}

export interface UpgradeSuggestion {
  id: string;
  category: string;
  title: string;
  description: string;
  effort: "easy" | "medium" | "hard";
  cost: "free" | "low" | "medium" | "high";
}

export interface BudgetUpgradePlan {
  items: UpgradeSuggestion[];
  totalBudget: number;
  currency: "INR";
}

export interface VisualBreakdown {
  label: string;
  score: number;
  maxScore: number;
}

export interface AuraReport {
  id: string;
  auditId: string;
  score: AuraScore;
  leaks: StatusLeak[];
  suggestions: UpgradeSuggestion[];
  visualBreakdown?: VisualBreakdown[];
  summary: string;
  createdAt: string;
  isPremium: boolean;
  premiumContent?: string;
}

export interface AuditInput {
  auditType: AuditType;
  goal: AuditGoal;
  budgetRange: BudgetAmount;
}

export interface AuditStats {
  totalAudits: number;
  unlockedReports: number;
  averageFreeScore: number | null;
  latestScore: number | null;
  bestScore: number | null;
  lastAuditDate: string | null;
}

export function createLocalId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}
