import type { ImageMetrics } from "@/types";

export type AuraTwinVariantType =
  | "original"
  | "brighter_lighting"
  | "cleaner_crop"
  | "background_focus"
  | "contrast_balance"
  | "premium_minimal"
  | "creator_bold"
  | "professional_clean"
  | "warm_dating"
  | "combined_best";

export type TwinGoal =
  | "dating_profile"
  | "instagram"
  | "professional"
  | "college_social"
  | "creator"
  | "general";

export interface AuraTwinVariant {
  id: string;
  type: AuraTwinVariantType;
  title: string;
  emoji: string;
  description: string;
  imageDataUrl: string;
  score: number;
  scoreDelta: number;
  metrics: ImageMetrics;
  improvementReason: string;
  freeFix: string;
  paidFix?: string;
  estimatedCost: string;
  isFree: boolean;
  caution?: string;
}

export interface AuraTwinResult {
  id: string;
  sourceAuditId?: string;
  originalImageDataUrl: string;
  originalScore: number;
  bestVariantId: string;
  variants: AuraTwinVariant[];
  rankedVariantIds: string[];
  freeUpgradeWinner: string;
  paidUpgradeWinner: string;
  statusRoiSummary: string;
  avoidForNow: string;
  finalStrategy: string;
  actionTiers: { tier: number; label: string; actions: string[] }[];
  goal?: TwinGoal;
  createdAt: string;
  updatedAt: string;
}

export const TWIN_VARIANT_META: Record<AuraTwinVariantType, {
  title: string;
  emoji: string;
  description: string;
  isFree: boolean;
  estimatedCost: string;
}> = {
  original: {
    title: "Original",
    emoji: "📸",
    description: "Your current image as-is.",
    isFree: true,
    estimatedCost: "₹0",
  },
  brighter_lighting: {
    title: "Brighter Lighting",
    emoji: "☀️",
    description: "Increased brightness and slightly boosted contrast for a clearer, well-lit look.",
    isFree: true,
    estimatedCost: "₹0 — Natural window light",
  },
  cleaner_crop: {
    title: "Cleaner Crop",
    emoji: "✂️",
    description: "Centered crop with improved framing and composition for profile-readiness.",
    isFree: true,
    estimatedCost: "₹0 — Reframe your shot",
  },
  background_focus: {
    title: "Background Focus",
    emoji: "🎯",
    description: "Subtle vignette and edge darkening to draw attention to the subject.",
    isFree: true,
    estimatedCost: "₹0 — Declutter or plain wall",
  },
  contrast_balance: {
    title: "Contrast Balance",
    emoji: "⚖️",
    description: "Normalized contrast and saturation for a balanced, pleasing visual weight.",
    isFree: true,
    estimatedCost: "₹0 — Adjust camera settings or angle",
  },
  premium_minimal: {
    title: "Premium Minimal",
    emoji: "✨",
    description: "Slightly desaturated with improved contrast and a clean, understated tone.",
    isFree: false,
    estimatedCost: "Under ₹1,000 — Simple backdrop or better wall",
  },
  creator_bold: {
    title: "Creator Bold",
    emoji: "🔥",
    description: "Increased clarity, contrast, and saturation for a punchy creator/Instagram look.",
    isFree: false,
    estimatedCost: "Under ₹1,000 — Ring light or phone tripod",
  },
  professional_clean: {
    title: "Professional Clean",
    emoji: "💼",
    description: "Balanced brightness, controlled contrast, and neutral color for a polished professional look.",
    isFree: false,
    estimatedCost: "Under ₹2,000 — Clean shirt or backdrop cloth",
  },
  warm_dating: {
    title: "Warm Dating",
    emoji: "🌅",
    description: "Slight warmth, soft contrast, and natural brightness for an inviting dating profile look.",
    isFree: false,
    estimatedCost: "Under ₹2,000 — Warm lamp or golden-hour window light",
  },
  combined_best: {
    title: "Combined Best",
    emoji: "🏆",
    description: "A smart blend of the top two performing free improvements applied together.",
    isFree: true,
    estimatedCost: "₹0 — Free fixes combined",
  },
};

export const TWIN_GOAL_LABELS: Record<TwinGoal, string> = {
  dating_profile: "Dating Profile",
  instagram: "Instagram / Creator",
  professional: "Professional",
  college_social: "College / Social",
  creator: "Creator / Portfolio",
  general: "General Improvement",
};

export const TWIN_GOAL_PREFERENCES: Record<TwinGoal, AuraTwinVariantType[]> = {
  dating_profile: ["warm_dating", "brighter_lighting", "cleaner_crop", "background_focus"],
  instagram: ["creator_bold", "contrast_balance", "cleaner_crop"],
  professional: ["professional_clean", "premium_minimal", "background_focus"],
  college_social: ["brighter_lighting", "cleaner_crop", "premium_minimal"],
  creator: ["creator_bold", "contrast_balance", "cleaner_crop", "brighter_lighting"],
  general: [],
};
