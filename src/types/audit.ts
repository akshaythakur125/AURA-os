import type { DeepAuditInput, PersonalizationResult } from "./personalization";

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
  deepInput?: DeepAuditInput;
  personalization?: PersonalizationResult;
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
  fix: string;
  impactScore: number;
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
  budgetRange: number;
  priority: string;
  actions: string[];
  estimatedImpact: string;
  currency: "INR";
}

export interface QuickFix {
  title: string;
  effort: "easy" | "medium" | "hard";
  cost: "free" | "low" | "medium" | "high";
  description: string;
}

export interface ImageSignalMetrics {
  width: number;
  height: number;
  aspectRatio: number;
  brightness: number;
  contrast: number;
  saturation: number;
  sharpness: number;
  edgeDensity: number;
  resolutionScore: number;
  lightingScore: number;
  clarityScore: number;
  compositionScore: number;
  backgroundComplexityEstimate: number;
  overallImageQualityScore: number;
}

export interface FreeAuraResult {
  auraScore: number;
  category: string;
  oneLineVerdict: string;
  strongestSignals: string[];
  statusLeaks: StatusLeak[];
  quickFixes: QuickFix[];
  budgetUpgradePlan: BudgetUpgradePlan;
  imageMetrics: ImageSignalMetrics;
  generatedAt: string;
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
  freeResult?: FreeAuraResult;
  fullContent?: FullAuraReportContent;
}

export interface AuditInput {
  auditType: AuditType;
  goal: AuditGoal;
  budgetRange: BudgetAmount;
}

export interface FullStatusLeak {
  title: string;
  explanation: string;
  fix: string;
  severity: "low" | "medium" | "high";
  impactScore: number;
  estimatedCost: "free" | "low" | "medium" | "high";
}

export interface PriorityUpgradeMap {
  firstPriority: string;
  secondPriority: string;
  avoidForNow: string;
}

export interface TieredBudgetPlan {
  immediateFree: string[];
  under2000: string[];
  under5000: string[];
  under10000: string[];
  under25000: string[];
}

export interface PhotoGuidance {
  lighting: string;
  framing: string;
  background: string;
  posingOrPresentation: string;
  editing: string;
}

export interface GoalSpecificAdvice {
  goal: string;
  strategy: string;
  doThis: string;
  avoidThis: string;
}

export interface FullAuraReportContent {
  fullScore: number;
  category: string;
  detailedVerdict: string;
  visualBreakdown: {
    lighting: number;
    clarity: number;
    composition: number;
    backgroundControl: number;
    colorSignal: number;
    premiumSignal: number;
    overallConsistency: number;
  };
  strongestSignals: string[];
  biggestStatusLeaks: FullStatusLeak[];
  priorityUpgradeMap: PriorityUpgradeMap;
  budgetUpgradePlan: TieredBudgetPlan;
  photoGuidance: PhotoGuidance;
  goalSpecificAdvice: GoalSpecificAdvice;
  finalVerdict: string;
  generatedAt: string;
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
