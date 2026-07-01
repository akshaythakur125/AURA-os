export interface LaunchScore {
  total: number;
  categories: LaunchCategory[];
  label: LaunchLabel;
}

export interface LaunchCategory {
  name: string;
  score: number;
  maxScore: number;
  checks: LaunchCheck[];
}

export interface LaunchCheck {
  name: string;
  status: "pass" | "fail" | "warning" | "manual";
  message: string;
}

export type LaunchLabel = "not_ready" | "test_mode" | "soft_launch" | "production_ready";

export const LAUNCH_LABELS: Record<LaunchLabel, { label: string; minScore: number }> = {
  not_ready: { label: "Not ready for launch", minScore: 0 },
  test_mode: { label: "Test mode only", minScore: 50 },
  soft_launch: { label: "Soft launch ready", minScore: 75 },
  production_ready: { label: "Production launch ready", minScore: 90 },
};

export interface LaunchChecklistItem {
  id: string;
  label: string;
  category: string;
  checked: boolean;
  checkedAt?: string;
}

export interface ProductionWarning {
  type: "critical" | "warning" | "info";
  message: string;
  fix?: string;
}
