export interface SmokeTestResult {
  testName: string;
  status: "pass" | "fail" | "manual" | "skipped";
  message: string;
  durationMs: number;
}

export interface SmokeTestSuite {
  name: string;
  tests: SmokeTestResult[];
  passed: number;
  failed: number;
  manual: number;
  total: number;
  startedAt: string;
  completedAt: string;
}
