export interface SecurityAuditResult {
  score: number;
  label: SecurityLabel;
  categories: SecurityCategory[];
  criticalBlockers: SecurityCheck[];
  timestamp: string;
}

export type SecurityLabel = "unsafe" | "test_mode" | "acceptable" | "production_ready";

export interface SecurityCategory {
  name: string;
  score: number;
  maxScore: number;
  checks: SecurityCheck[];
}

export interface SecurityCheck {
  name: string;
  status: "pass" | "fail" | "warning" | "manual";
  message: string;
}

export interface SecurityEvent {
  id: string;
  eventType: SecurityEventType;
  severity: "low" | "medium" | "high" | "critical";
  message: string;
  source?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export type SecurityEventType =
  | "payment_signature_invalid"
  | "webhook_signature_invalid"
  | "payment_amount_mismatch"
  | "duplicate_unlock_attempt"
  | "manual_unlock_used"
  | "founder_code_used"
  | "payment_recovery_failed"
  | "unsafe_payment_request_blocked"
  | "unsafe_redirect_blocked"
  | "admin_login"
  | "admin_logout"
  | "rate_limit_exceeded"
  | "invalid_input_detected"
  | "secret_exposure_detected"
  | "rls_violation_attempt";

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  identifier: string;
}
