import type {
  AuraScore,
  StatusLeak,
  UpgradeSuggestion,
} from "@/types/audit";

export interface ScoringInput {
  auditType: string;
  goal: string;
  budgetRange: number;
  visualFactors?: Record<string, number>;
  presentationFactors?: Record<string, number>;
}

export interface ScoringOutput {
  score: AuraScore;
  leaks: StatusLeak[];
  suggestions: UpgradeSuggestion[];
}

export interface Rule {
  id: string;
  category: string;
  weight: number;
  evaluate: (input: ScoringInput) => number;
  generateLeaks: (input: ScoringInput, score: number) => StatusLeak[];
  generateSuggestions: (input: ScoringInput) => UpgradeSuggestion[];
}
