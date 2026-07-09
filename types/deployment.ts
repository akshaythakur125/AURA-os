export interface DeploymentChecklist {
  categories: DeploymentCategory[];
  score: number;
  label: "not_ready" | "preview_ready" | "soft_launch_ready" | "production_ready";
  criticalBlockers: DeploymentCheck[];
}

export interface DeploymentCategory {
  name: string;
  score: number;
  maxScore: number;
  checks: DeploymentCheck[];
}

export interface DeploymentCheck {
  name: string;
  status: "pass" | "fail" | "warning" | "manual";
  message: string;
}

export interface DomainInfo {
  domain: string;
  configured: boolean;
  appUrl: string;
  checks: DeploymentCheck[];
}

export interface VercelInfo {
  deployed: boolean;
  url?: string;
  checks: DeploymentCheck[];
}

export interface PostDeployResult {
  testName: string;
  status: "pass" | "fail" | "manual";
  message: string;
  durationMs: number;
}
