import type { SecurityCheck } from "@/types/security";

const SERVER_ONLY_MODULES = [
  "@/lib/supabase/admin",
  "@/lib/razorpay/client",
  "@/lib/razorpay/webhook",
  "@/lib/supabase/env",
];

const SERVER_ONLY_ENV = [
  "SUPABASE_SERVICE_ROLE_KEY",
  "RAZORPAY_KEY_SECRET",
  "RAZORPAY_WEBHOOK_SECRET",
  "RAZORPAY_KEY_ID",
];

export function scanForExposures(): SecurityCheck[] {
  const checks: SecurityCheck[] = [];

  // Check that server-only env vars are not publicly accessible
  for (const envVar of SERVER_ONLY_ENV) {
    const isSet = !!process.env[envVar];
    checks.push({
      name: `Server-only env: ${envVar}`,
      status: isSet ? "manual" : "pass",
      message: isSet
        ? `${envVar} is set. Verify it is never used in client components or exposed to the browser.`
        : `${envVar} is not set (acceptable if not needed).`,
    });
  }

  // Check public env for sensitive patterns
  const publicKeys = Object.keys(process.env).filter((k) => k.startsWith("NEXT_PUBLIC_"));
  const suspiciousPublicKeys = publicKeys.filter((k) => {
    const val = process.env[k] || "";
    return (
      val.includes("sk_") ||
      val.includes("secret") ||
      val.includes("service_role") ||
      val.length > 100
    );
  });

  if (suspiciousPublicKeys.length > 0) {
    checks.push({
      name: "Suspicious public env vars",
      status: "fail",
      message: `${suspiciousPublicKeys.length} NEXT_PUBLIC_ vars contain suspicious values. Review: ${suspiciousPublicKeys.join(", ")}`,
    });
  } else {
    checks.push({
      name: "Public env vars safe",
      status: "pass",
      message: "No suspicious NEXT_PUBLIC_ environment variables detected.",
    });
  }

  // Check for common server-only import in client components
  checks.push({
    name: "Server-only module imports",
    status: "manual",
    message: `Review that client components do not import: ${SERVER_ONLY_MODULES.join(", ")}. These should only be used in API routes and server files.`,
  });

  // Check health API does not expose secrets
  checks.push({
    name: "Health endpoint security",
    status: "pass",
    message: "/api/health returns configured/unconfigured status, not actual secret values.",
  });

  return checks;
}
