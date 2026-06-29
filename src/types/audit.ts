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
  profileTexts?: ProfileTexts;
  datingProfileReport?: DatingProfileReport;
  glowupPlan?: GlowupPlan;
  unlockedProducts?: import("./payment").ProductType[];
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

// ── Dating Profile Audit Types ──

export interface DatingProfileReport {
  textScore: number;
  bioAnalysis: BioAnalysis;
  promptAnalysis: PromptAnalysis[];
  redFlags: RedFlag[];
  suggestedBios: SuggestedBio[];
  overallAdvice: string;
  generatedAt: string;
}

export interface BioAnalysis {
  length: "too_short" | "good" | "too_long";
  effort: "low" | "medium" | "high";
  tone: string;
  hooksReader: boolean;
  showsPersonality: boolean;
  feedback: string;
}

export interface PromptAnalysis {
  prompt: string;
  answer: string;
  quality: "weak" | "average" | "good" | "excellent";
  feedback: string;
  suggestedImprovement: string;
}

export interface RedFlag {
  text: string;
  type: "negative" | "cliche" | "low_effort" | "aggressive" | "desperate" | "vague";
  severity: "low" | "medium" | "high";
  explanation: string;
  fixSuggestion: string;
}

export interface SuggestedBio {
  version: string;
  text: string;
  whyItWorks: string;
}

// ── 30-Day Glow-Up Plan Types ──

export interface GlowupPlan {
  week1: WeekPlan;
  week2: WeekPlan;
  week3: WeekPlan;
  week4: WeekPlan;
  budgetRoadmap: BudgetRoadmap2;
  generatedAt: string;
}

export interface WeekPlan {
  title: string;
  focus: string;
  dailyMissions: DailyMission[];
}

export interface DailyMission {
  day: number;
  category: "photo" | "grooming" | "outfit" | "background" | "mindset";
  title: string;
  description: string;
  effort: "easy" | "medium" | "hard";
  isCompleted?: boolean;
}

export interface BudgetRoadmap2 {
  free: string[];
  under2000: string[];
  under5000: string[];
  under10000: string[];
  totalEstimatedCost: number;
}

// ── Profile Texts for Dating/Instagram Input ──

export interface ProfileTexts {
  bio?: string;
  prompts?: { prompt: string; answer: string }[];
  captions?: string;
  photosDescription?: string;
}

export function createLocalId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}
