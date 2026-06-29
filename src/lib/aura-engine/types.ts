import type {
  AuraScore,
  StatusLeak,
  UpgradeSuggestion,
} from "@/types/audit";

export interface ScoringInput {
  imageCount: number;
  type: string;
  goal: string;
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
