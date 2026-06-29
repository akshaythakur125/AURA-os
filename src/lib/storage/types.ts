import type { Audit, AuraReport } from "@/types/audit";

export interface StorageData {
  audits: Audit[];
  reports: AuraReport[];
  preferences: {
    theme: "dark" | "light";
    onboardingComplete: boolean;
  };
}

export const DEFAULT_STORAGE: StorageData = {
  audits: [],
  reports: [],
  preferences: {
    theme: "dark",
    onboardingComplete: false,
  },
};

export type StorageKey = keyof StorageData;

export type StorageListener = (data: StorageData) => void;
