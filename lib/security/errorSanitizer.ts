import type { SecurityEventType } from "@/types/security";
import { addSecurityEvent } from "./securityEventStore";

export interface SafeError {
  message: string;
  code: string;
  statusCode: number;
  requestId?: string;
}

const SENSITIVE_PATTERNS = [
  /sk_(live|test)_[a-z0-9]+/gi,
  /rzp_(live|test)_[a-zA-Z0-9]+/gi,
  /sbx_[a-zA-Z0-9]+/gi,
  /eyJ[a-zA-Z0-9_-]+\.eyJ[a-zA-Z0-9_-]+/gi,
  /(-----BEGIN[^-]+-----)/g,
];

export function sanitizeError(error: unknown, context?: string): SafeError {
  const message = extractMessage(error);
  const safeMessage = removeSensitiveData(message);

  if (context === "admin") {
    return {
      message: safeMessage,
      code: "ADMIN_ERROR",
      statusCode: 500,
    };
  }

  return {
    message: safeMessage.length > 200 ? safeMessage.slice(0, 200) + "..." : safeMessage,
    code: "INTERNAL_ERROR",
    statusCode: 500,
  };
}

export function sanitizeAndLog(
  error: unknown,
  options?: { context?: string; eventType?: SecurityEventType; severity?: "low" | "medium" | "high" | "critical" }
): SafeError {
  const safe = sanitizeError(error, options?.context);

  if (options?.eventType && typeof window !== "undefined") {
    try {
      addSecurityEvent({
        eventType: options.eventType,
        severity: options.severity || "medium",
        message: safe.message,
        metadata: { code: safe.code },
      });
    } catch {
      // never crash in error handling
    }
  }

  return safe;
}

function extractMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  if (error && typeof error === "object") {
    const msg = (error as Record<string, unknown>).message;
    if (typeof msg === "string") return msg;
  }
  return "An unexpected error occurred";
}

function removeSensitiveData(text: string): string {
  let result = text;
  for (const pattern of SENSITIVE_PATTERNS) {
    result = result.replace(pattern, "[REDACTED]");
  }
  return result;
}
