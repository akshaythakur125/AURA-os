import { getItem, setItem } from "./localStore";

const ONBOARDING_KEY = "auracheck:v1:onboarding";

export interface OnboardingState {
  hasSeenIntro: boolean;
  hasCreatedFirstAudit: boolean;
  hasGeneratedFreeScore: boolean;
  hasVisitedUnlock: boolean;
  hasSharedCard: boolean;
}

const defaults: OnboardingState = {
  hasSeenIntro: false,
  hasCreatedFirstAudit: false,
  hasGeneratedFreeScore: false,
  hasVisitedUnlock: false,
  hasSharedCard: false,
};

export function getOnboardingState(): OnboardingState {
  return { ...defaults, ...getItem<Partial<OnboardingState>>(ONBOARDING_KEY, {}) };
}

export function updateOnboardingState(updates: Partial<OnboardingState>): OnboardingState {
  const current = getOnboardingState();
  const updated = { ...current, ...updates };
  setItem(ONBOARDING_KEY, updated);
  return updated;
}

export function resetOnboarding(): void {
  setItem(ONBOARDING_KEY, defaults);
}

export function getOnboardingProgress(): { completed: number; total: number; percentage: number } {
  const state = getOnboardingState();
  const total = 5;
  const completed = [state.hasSeenIntro, state.hasCreatedFirstAudit, state.hasGeneratedFreeScore, state.hasVisitedUnlock, state.hasSharedCard].filter(Boolean).length;
  return { completed, total, percentage: Math.round((completed / total) * 100) };
}
