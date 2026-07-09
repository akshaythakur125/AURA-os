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
  styleIntent: StyleIntent | null;
  currentSignals: CurrentSignalItem[];
  biggestConcern: BiggestConcern | null;
  occasionContext: OccasionContext | null;
  spendComfort: SpendComfort | null;
  selfRatedConfidence: SelfRatedConfidence | null;
  wantsDirectFeedback: boolean;
  notes: string;
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

export interface PersonalizationResult {
  archetype: StatusArchetype;
  archetypeExplanation: string;
  signalMismatches: SignalMismatch[];
  goalStrategy: string;
  tonePreference: "direct" | "soft";
  userPriority: string;
  recommendedFocus: string[];
}

export const STYLE_INTENT_LABELS: Record<StyleIntent, string> = {
  premium: "Premium",
  clean: "Clean",
  attractive: "Attractive",
  professional: "Professional",
  confident: "Confident",
  creator: "Creator-like",
  college: "College-ready",
  understated: "Understated",
  bold: "Bold",
};

export const SIGNAL_ITEM_LABELS: Record<CurrentSignalItem, string> = {
  phone_visible: "Phone visible",
  watch_visible: "Watch visible",
  shoes_visible: "Shoes visible",
  branded_item_visible: "Branded item visible",
  bike_car_visible: "Bike/car visible",
  gym_body_signal: "Gym/body signal",
  travel_signal: "Travel signal",
  cafe_signal: "Café/social signal",
  room_signal: "Room/background signal",
  none: "None",
};

export const CONCERN_LABELS: Record<BiggestConcern, string> = {
  looking_average: "I look average",
  weak_photos: "My photos are weak",
  low_matches: "I get low matches",
  poor_instagram: "My Instagram looks poor",
  outfit_confusion: "I do not know what to wear",
  looking_tryhard: "I look try-hard",
  background_issue: "My background is weak",
  grooming_issue: "Grooming issue",
  not_sure: "Not sure",
};

export const OCCASION_LABELS: Record<OccasionContext, string> = {
  dating_profile: "Dating profile",
  instagram_post: "Instagram post",
  college_daily: "College daily/social life",
  office_profile: "Office/professional profile",
  party_event: "Party/event",
  family_function: "Family function",
  creator_content: "Creator content",
  general_profile: "General profile",
};

export const SPEND_LABELS: Record<SpendComfort, string> = {
  no_spend: "No spend",
  under_2000: "Under ₹2,000",
  under_5000: "Under ₹5,000",
  under_10000: "Under ₹10,000",
  flexible: "Flexible",
};

export const CONFIDENCE_LABELS: Record<SelfRatedConfidence, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

export const ARCHETYPE_EXPLANATIONS: Record<StatusArchetype, string> = {
  "Clean Basic": "Clean, understated presentation with minimal flex signals. This archetype signals reliability and effortlessness, but could benefit from slightly more intentional styling.",
  "Urban Aspirational": "Modern, trend-aware presentation with visible lifestyle signals like phones, cafes, or watches. You signal ambition and worldliness, but ensure the fundamentals (lighting, clarity) support the image.",
  "Premium Minimalist": "Refined, intentional presentation with clean backgrounds and controlled color. This is a high-signal archetype that suggests confidence without needing to flex.",
  "Loud Flex": "Bold, high-visibility presentation with multiple status signals competing for attention. The intent to impress is clear — simplifying would make each signal stronger.",
  "Soft Luxury": "Understated but elevated presentation. The signals are subtle — good materials, clean lines, controlled environment. This archetype suggests taste without shouting.",
  "Creator Vibe": "Content-aware presentation optimized for visual platforms. Strong composition and style coherence. The signal says 'I understand how to present visually.'",
  "College Casual": "Relaxed, everyday presentation suited for campus life. The signal is authentic but could benefit from more intentional grooming and framing.",
  "Corporate Sharp": "Professional, mature presentation aligned with workplace expectations. Clean, structured, and reliable. The archetype signals competence and readiness.",
  "Try-Hard Signal": "The presentation may be trying to signal premium value, but too many elements compete for attention. Removing one or two items will make the overall impression stronger.",
  "Mismatched Flex": "Status signals are present but the fundamentals — lighting, clarity, background — are not supporting them. Fixing the basics will make existing signals much more effective.",
  "Low-Clarity Potential": "The intent and potential are visible, but technical quality (lighting, sharpness, framing) is holding the presentation back. Fixing these will unlock the underlying signal.",
};
