import type { ProductType } from "@/types";

export type ProofCategory =
  | "lighting_fix"
  | "background_fix"
  | "crop_fix"
  | "profile_order_fix"
  | "grooming_base"
  | "outfit_consistency"
  | "glowup_system";

export interface ProofExample {
  id: string;
  title: string;
  category: ProofCategory;
  beforeScore: number;
  afterScore: number;
  scoreDelta: number;
  biggestLeak: string;
  fixApplied: string;
  costLabel: string;
  timeLabel: string;
  productSuggested: ProductType;
  beforeVisualDescription: string;
  afterVisualDescription: string;
  keyLesson: string;
  ctaText: string;
  ctaHref: string;
  isDemo: boolean;
  createdAt: string;
}
