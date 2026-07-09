export type ProfileGoal = "dating" | "instagram" | "professional" | "college" | "creator" | "general";

export type PreferredTone =
  | "clean"
  | "witty"
  | "confident"
  | "premium"
  | "warm"
  | "professional"
  | "minimal";

export type AvoidTone =
  | "try-hard"
  | "arrogant"
  | "boring"
  | "over-flexing"
  | "generic"
  | "desperate"
  | "too-many-emojis"
  | "too-formal"
  | "too-casual";

export interface ProfileTextInput {
  bio?: string;
  prompts?: string[];
  captions?: string[];
  profileGoal?: ProfileGoal;
  preferredTone?: PreferredTone;
  avoidTone?: AvoidTone[];
  notes?: string;
}

export interface ProfileTextMetrics {
  bioLength: number;
  promptCount: number;
  captionCount: number;
  clarityScore: number;
  originalityScore: number;
  tryHardRiskScore: number;
  negativityRiskScore: number;
  statusOverloadScore: number;
  warmthScore: number;
  confidenceSignalScore: number;
  readabilityScore: number;
  clichéFlags: string[];
  improvementFlags: string[];
}

export interface BioFeedback {
  overall: string;
  strengths: string[];
  weaknesses: string[];
  clichéCount: number;
  emojiDensity: string;
  lengthAssessment: string;
}

export interface PromptFeedback {
  prompt: string;
  feedback: string;
  originalityScore: number;
  suggestion: string;
}

export interface ProfileAuditResult {
  profileScore: number;
  profileFrictionSummary: string;
  textMetrics: ProfileTextMetrics;
  bioFeedback: BioFeedback | null;
  promptFeedback: PromptFeedback[];
  captionFeedback: string[];
  redFlags: string[];
  suggestedBioVersions: string[];
  suggestedPromptIdeas: string[];
  photoOrderStrategy: string[];
  doThis: string[];
  avoidThis: string[];
  finalProfileStrategy: string;
  generatedAt: string;
}

export const PREFERRED_TONE_LABELS: Record<PreferredTone, string> = {
  clean: "Clean",
  witty: "Witty",
  confident: "Confident",
  premium: "Premium",
  warm: "Warm",
  professional: "Professional",
  minimal: "Minimal",
};

export const AVOID_TONE_LABELS: Record<AvoidTone, string> = {
  "try-hard": "Looking try-hard",
  arrogant: "Looking arrogant",
  boring: "Looking boring",
  "over-flexing": "Over-flexing",
  generic: "Sounding generic",
  desperate: "Sounding desperate",
  "too-many-emojis": "Too many emojis",
  "too-formal": "Too formal",
  "too-casual": "Too casual",
};

export const PROFILE_GOAL_LABELS: Record<ProfileGoal, string> = {
  dating: "Dating",
  instagram: "Instagram",
  professional: "Professional",
  college: "College",
  creator: "Creator",
  general: "General",
};
