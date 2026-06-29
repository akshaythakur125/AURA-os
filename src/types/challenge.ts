export type ChallengeType =
  | "status_leak"
  | "glowup_before_after"
  | "budget_upgrade"
  | "clean_profile"
  | "best_background"
  | "no_iphone_premium"
  | "college_aura"
  | "dating_profile_fix";

export interface Challenge {
  id: string;
  title: string;
  slug: string;
  description: string;
  type: ChallengeType;
  entryRequirement: string;
  rewardText: string;
  isActive: boolean;
  createdAt: string;
}

export interface ChallengeEntry {
  id: string;
  challengeId: string;
  auditId?: string;
  auraScore?: number;
  archetype?: string;
  biggestStatusLeak?: string;
  shareCardData?: string;
  createdAt: string;
}
