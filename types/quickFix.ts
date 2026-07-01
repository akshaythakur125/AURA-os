export interface QuickAuraFixReport {
  quickFixScore: number;
  biggestLeak: string;
  leakExplanation: string;
  whyItMatters: string;
  fastestFreeFix: string;
  under500Fix: string;
  under2000Fix: string;
  avoidForNow: string;
  threeStepActionPlan: string[];
  expectedPresentationShift: string;
  upgradePriority: "lighting" | "clarity" | "composition" | "background" | "styling";
  finalOneLineAdvice: string;
  generatedAt: string;
}
