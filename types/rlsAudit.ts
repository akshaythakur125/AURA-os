export interface RlsCheck {
  table: string;
  rlsEnabled: boolean;
  hasPolicies: boolean;
  riskLevel: "low" | "medium" | "high";
  note: string;
  requiredAction: string;
}

export interface RlsAuditResult {
  database: string;
  checks: RlsCheck[];
  totalTables: number;
  protectedTables: number;
  needsReview: number;
  generatedAt: string;
}
