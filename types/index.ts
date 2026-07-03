import type { DeepAuditInput, PersonalizationResult } from "@/types/personalization";
import type { ProfileTextInput, ProfileAuditResult } from "@/types/profileAudit";
import type { GlowUpPlan } from "@/types/glowup";
import type { QuickAuraFixReport } from "@/types/quickFix";

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

export type ProductType = "quick_fix" | "aura_report" | "dating_audit" | "glowup_plan";

export type ReportStatus = "draft" | "free_generated" | "full_report";

export interface BattleRecord {
  id: string;
  timestamp: string;
  leftLabel: string;
  rightLabel: string;
  leftScore: number;
  rightScore: number;
  leftLeaks: string[];
  rightLeaks: string[];
  winner: "left" | "right" | "tie";
}

export interface Audit {
  id: string;
  auditType: AuditType;
  goal: Goal;
  budgetRange: BudgetRange;
  imageDataUrl: string;
  imageMeta: ImageMeta;
  reportStatus: ReportStatus;
  freeScore?: number;
  freeSummary?: string;
  freeResult?: FreeAuraResult;
  fullScore?: number;
  fullReport?: FullAuraReport;
  deepInput?: DeepAuditInput;
  personalization?: PersonalizationResult;
  profileTextInput?: ProfileTextInput;
  quickFixReport?: QuickAuraFixReport;
  datingProfileReport?: ProfileAuditResult;
  glowupPlan?: GlowUpPlan;
  unlockedProducts?: ProductType[];
  createdAt: string;
  updatedAt: string;
}

export interface UserPreferences {
  displayName?: string;
  city?: string;
}

export interface ImageMetrics {
  width: number;
  height: number;
  aspectRatio: number;
  brightness: number;
  contrast: number;
  saturation: number;
  sharpness: number;
  edgeDensity: number;
  lightingScore: number;
  clarityScore: number;
  compositionScore: number;
  backgroundComplexityEstimate: number;
  overallImageQualityScore: number;
}

export interface StatusLeak {
  title: string;
  explanation: string;
  fix: string;
  severity: "low" | "medium" | "high";
  impactScore: number;
}

export interface BudgetAction {
  budgetRange: BudgetRange;
  priority: number;
  actions: string[];
  estimatedImpact: string;
}

export type Category =
  | "Clean but Basic"
  | "Urban Aspirational"
  | "Premium Potential"
  | "Strong Visual Signal"
  | "Overdone / Busy Signal"
  | "Low-Clarity Presentation";

export interface FreeAuraResult {
  auraScore: number;
  category: Category;
  oneLineVerdict: string;
  strongestSignals: string[];
  statusLeaks: StatusLeak[];
  quickFixes: string[];
  budgetUpgradePlan: BudgetAction[];
  imageMetrics: ImageMetrics;
  generatedAt: string;
}

export interface VisualBreakdown {
  lighting: number;
  clarity: number;
  composition: number;
  backgroundControl: number;
  colorSignal: number;
  premiumSignal: number;
  overallConsistency: number;
}

export interface BiggestStatusLeak {
  title: string;
  explanation: string;
  fix: string;
  severity: "low" | "medium" | "high";
  impactScore: number;
  estimatedCost: string;
}

export interface PriorityUpgradeMap {
  firstPriority: string;
  secondPriority: string;
  avoidForNow: string;
}

export interface BudgetUpgradePlan {
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
  presentation: string;
  editing: string;
}

export interface FullAuraReport {
  fullScore: number;
  category: Category;
  detailedVerdict: string;
  visualBreakdown: VisualBreakdown;
  strongestSignals: string[];
  biggestStatusLeaks: BiggestStatusLeak[];
  priorityUpgradeMap: PriorityUpgradeMap;
  budgetUpgradePlan: BudgetUpgradePlan;
  photoGuidance: PhotoGuidance;
  finalVerdict: string;
  generatedAt: string;
}
