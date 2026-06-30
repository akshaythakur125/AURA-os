export interface DailyMission {
  day: number;
  title: string;
  task: string;
  reason: string;
  timeRequired: string;
  cost: "free" | "low" | "medium" | "high";
}

export interface WeekMission {
  day: string;
  title: string;
  task: string;
}

export interface WeeklyPlan {
  weekNumber: number;
  theme: string;
  objective: string;
  missions: WeekMission[];
  checklist: string[];
  estimatedCost: string;
}

export interface BudgetRoadmap {
  free: string[];
  under2000: string[];
  under5000: string[];
  under10000: string[];
  under25000: string[];
}

export interface PhotoSystem {
  bestPhotoTypes: string[];
  lightingGuide: string;
  framingGuide: string;
  locationIdeas: string[];
}

export interface GroomingSystem {
  dailyBasics: string[];
  weeklyHabits: string[];
  productSuggestions: string[];
}

export interface OutfitSystem {
  capsuleWardrobe: string[];
  fitTips: string[];
  colorGuidelines: string[];
  shoeGuide: string[];
}

export interface BackgroundSystem {
  goodBackgrounds: string[];
  badBackgrounds: string[];
  quickFixGuide: string[];
}

export interface ProgressTracking {
  checkInDays: number[];
  weeklyReflection: string;
  habitTracker: string[];
}

export interface GlowUpPlan {
  planScore: number;
  planTitle: string;
  startingPointSummary: string;
  primaryBottleneck: string;
  weeklyPlan: WeeklyPlan[];
  dailyMissions: DailyMission[];
  budgetRoadmap: BudgetRoadmap;
  shoppingOrActionList: string[];
  photoSystem: PhotoSystem;
  groomingSystem: GroomingSystem;
  outfitSystem: OutfitSystem;
  backgroundSystem: BackgroundSystem;
  progressTracking: ProgressTracking;
  avoidForNow: string[];
  expectedPresentationShift: string;
  finalAdvice: string;
  generatedAt: string;
}
