import { getItem, setItem } from "@/lib/storage/localStore";

export interface OnboardingState {
  hasSeenIntro: boolean;
  hasCreatedFirstAudit: boolean;
  hasGeneratedFreeScore: boolean;
  hasVisitedUnlock: boolean;
  hasSharedCard: boolean;
  hasEnteredChallenge: boolean;
  hasComparedProgress: boolean;
}

const KEY = "auracheck:v1:onboarding";

const DEFAULTS: OnboardingState = {
  hasSeenIntro: false,
  hasCreatedFirstAudit: false,
  hasGeneratedFreeScore: false,
  hasVisitedUnlock: false,
  hasSharedCard: false,
  hasEnteredChallenge: false,
  hasComparedProgress: false,
};

export function getOnboardingState(): OnboardingState {
  return getItem<OnboardingState>(KEY, DEFAULTS);
}

export function updateOnboarding(updates: Partial<OnboardingState>): OnboardingState {
  const current = getOnboardingState();
  const next = { ...current, ...updates };
  setItem(KEY, next);
  return next;
}

export function getOnboardingProgress(): { completed: number; total: number; percentage: number } {
  const state = getOnboardingState();
  const steps = [
    state.hasSeenIntro,
    state.hasCreatedFirstAudit,
    state.hasGeneratedFreeScore,
    state.hasVisitedUnlock,
    state.hasSharedCard,
    state.hasEnteredChallenge,
    state.hasComparedProgress,
  ];
  const completed = steps.filter(Boolean).length;
  const total = steps.length;
  return { completed, total, percentage: total > 0 ? Math.round((completed / total) * 100) : 0 };
}

export function clearOnboarding(): void {
  setItem(KEY, DEFAULTS);
}
