import type { LaunchCheck } from "@/types/launch";

export interface EnvAuditResult {
  checks: LaunchCheck[];
  publicEnv: Record<string, { present: boolean; value?: string }>;
  serverEnv: Record<string, { present: boolean }>;
}

const PUBLIC_ENV_KEYS = [
  "NEXT_PUBLIC_APP_URL",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "NEXT_PUBLIC_RAZORPAY_KEY_ID",
  "NEXT_PUBLIC_SUPPORT_EMAIL",
  "NEXT_PUBLIC_OWNER_WHATSAPP",
  "NEXT_PUBLIC_MANUAL_UPI_ID",
  "NEXT_PUBLIC_LOCAL_ADMIN_CODE",
  "NEXT_PUBLIC_DEMO_UNLOCK_CODE",
];

const SERVER_ENV_KEYS = [
  "SUPABASE_SERVICE_ROLE_KEY",
  "RAZORPAY_KEY_ID",
  "RAZORPAY_KEY_SECRET",
  "RAZORPAY_WEBHOOK_SECRET",
  "COMMERCE_REFRESH_SECRET",
  "LOCAL_ADMIN_CODE",
];

export function auditEnv(): EnvAuditResult {
  const checks: LaunchCheck[] = [];
  const publicEnv: Record<string, { present: boolean; value?: string }> = {};
  const serverEnv: Record<string, { present: boolean }> = {};

  for (const key of PUBLIC_ENV_KEYS) {
    const val = process.env[key];
    const present = !!val;
    publicEnv[key] = { present, value: val || undefined };

    if (!present) {
      checks.push({ name: `${key}`, status: "fail", message: `${key} is not set` });
    }
  }

  for (const key of SERVER_ENV_KEYS) {
    const val = process.env[key];
    const present = !!val;
    serverEnv[key] = { present };

    if (!present) {
      checks.push({ name: `${key}`, status: present ? "pass" : "warning", message: `${key} is not set` });
    }
  }

  // Specific checks
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "";
  if (appUrl && (appUrl.includes("localhost") || appUrl.includes("127.0.0.1"))) {
    checks.push({ name: "Production URL", status: "warning", message: "NEXT_PUBLIC_APP_URL is localhost — update for production" });
  }

  const adminCode = process.env.NEXT_PUBLIC_LOCAL_ADMIN_CODE || "ADMINDEMO";
  if (adminCode === "ADMINDEMO") {
    checks.push({ name: "Admin code", status: "warning", message: "Admin code is default ADMINDEMO — change for production" });
  }

  const demoCode = process.env.NEXT_PUBLIC_DEMO_UNLOCK_CODE || "AURADEMO";
  if (demoCode === "AURADEMO") {
    checks.push({ name: "Demo unlock code", status: "warning", message: "Demo unlock code is default AURADEMO — change for production" });
  }

  return { checks, publicEnv, serverEnv };
}
