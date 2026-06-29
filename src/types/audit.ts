export type AuditType =
  | "photo"
  | "profile"
  | "outfit"
  | "lifestyle"
  | "full";

export type AuditGoal =
  | "casual"
  | "professional"
  | "dating"
  | "social"
  | "general";

export interface BudgetRange {
  min: number;
  max: number;
  currency: "INR";
}

export type UnlockStatus = "locked" | "unlocked" | "pending";

export interface Audit {
  id: string;
  type: AuditType;
  goal: AuditGoal;
  createdAt: string;
  updatedAt: string;
  imageCount: number;
  unlockStatus: UnlockStatus;
  unlockCode?: string;
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

export interface AuraReport {
  id: string;
  auditId: string;
  score: AuraScore;
  leaks: StatusLeak[];
  suggestions: UpgradeSuggestion[];
  summary: string;
  createdAt: string;
  isPremium: boolean;
  premiumContent?: string;
}

export function createLocalId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}
