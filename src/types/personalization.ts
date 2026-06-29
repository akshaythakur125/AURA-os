export type StyleIntent =
  | "premium"
  | "clean"
  | "attractive"
  | "professional"
  | "confident"
  | "creator"
  | "college"
  | "understated"
  | "bold";

export type CurrentSignalItem =
  | "phone_visible"
  | "watch_visible"
  | "shoes_visible"
  | "branded_item_visible"
  | "bike_car_visible"
  | "gym_body_signal"
  | "travel_signal"
  | "cafe_signal"
  | "room_signal"
  | "none";

export type BiggestConcern =
  | "looking_average"
  | "weak_photos"
  | "low_matches"
  | "poor_instagram"
  | "outfit_confusion"
  | "looking_tryhard"
  | "background_issue"
  | "grooming_issue"
  | "not_sure";

export type OccasionContext =
  | "dating_profile"
  | "instagram_post"
  | "college_daily"
  | "office_profile"
  | "party_event"
  | "family_function"
  | "creator_content"
  | "general_profile";

export type SpendComfort =
  | "no_spend"
  | "under_2000"
  | "under_5000"
  | "under_10000"
  | "flexible";

export type SelfRatedConfidence = "low" | "medium" | "high";

export interface DeepAuditInput {
  styleIntent: StyleIntent;
  currentSignals: CurrentSignalItem[];
  biggestConcern: BiggestConcern;
  occasionContext: OccasionContext;
  spendComfort: SpendComfort;
  selfRatedConfidence: SelfRatedConfidence;
  wantsBrutalFeedback: boolean;
  notes?: string;
}

export type StatusArchetype =
  | "Clean Basic"
  | "Urban Aspirational"
  | "Premium Minimalist"
  | "Loud Flex"
  | "Soft Luxury"
  | "Creator Vibe"
  | "College Casual"
  | "Corporate Sharp"
  | "Try-Hard Signal"
  | "Mismatched Flex"
  | "Low-Clarity Potential";

export interface SignalMismatch {
  title: string;
  explanation: string;
  severity: "low" | "medium" | "high";
  correction: string;
  priorityScore: number;
}

export interface GoalStrategy {
  goal: string;
  strategyTitle: string;
  whatToOptimize: string;
  whatToAvoid: string;
  bestNextMove: string;
  suggestedPhotoDirection: string;
  suggestedStyleDirection: string;
}

export interface PersonalizationResult {
  archetype: StatusArchetype;
  archetypeExplanation: string;
  signalMismatches: SignalMismatch[];
  goalStrategy: GoalStrategy;
  tonePreference: "direct" | "balanced" | "soft";
  userPriority: string;
  recommendedFocus: string;
}
