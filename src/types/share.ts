export type ShareCardType = "free_result" | "full_report";

export type CardStyle = "premium_dark" | "clean_minimal" | "bold_score";

export interface ShareCardOptions {
  includeImage: boolean;
  includeStatusLeak: boolean;
  includeQuickFix: boolean;
  includeBranding: boolean;
  cardStyle: CardStyle;
}

export interface ShareCardData {
  auditId: string;
  auraScore: number;
  category: string;
  oneLineVerdict: string;
  biggestStatusLeak?: string;
  strongestSignal?: string;
  quickFix?: string;
  goal: string;
  auditType: string;
  imageDataUrl?: string;
  generatedAt: string;
  archetype?: string;
}
