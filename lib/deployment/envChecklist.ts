import type { DeploymentCheck } from "@/types/deployment";
import { detectProductionMode } from "./productionMode";

interface EnvGroup {
  name: string;
  vars: { key: string; required: boolean; serverOnly?: boolean }[];
}

const ENV_GROUPS: EnvGroup[] = [
  {
    name: "App",
    vars: [
      { key: "NEXT_PUBLIC_APP_URL", required: true },
    ],
  },
  {
    name: "Supabase",
    vars: [
      { key: "NEXT_PUBLIC_SUPABASE_URL", required: false },
      { key: "NEXT_PUBLIC_SUPABASE_ANON_KEY", required: false },
      { key: "SUPABASE_SERVICE_ROLE_KEY", required: false, serverOnly: true },
    ],
  },
  {
    name: "Razorpay",
    vars: [
      { key: "NEXT_PUBLIC_RAZORPAY_KEY_ID", required: false },
      { key: "RAZORPAY_KEY_ID", required: false, serverOnly: true },
      { key: "RAZORPAY_KEY_SECRET", required: false, serverOnly: true },
      { key: "RAZORPAY_WEBHOOK_SECRET", required: false, serverOnly: true },
    ],
  },
  {
    name: "Admin",
    vars: [
      { key: "LOCAL_ADMIN_CODE", required: false, serverOnly: true },
      { key: "NEXT_PUBLIC_LOCAL_ADMIN_CODE", required: false },
    ],
  },
  {
    name: "Support",
    vars: [
      { key: "NEXT_PUBLIC_SUPPORT_EMAIL", required: false },
      { key: "NEXT_PUBLIC_OWNER_WHATSAPP", required: false },
    ],
  },
  {
    name: "Commerce",
    vars: [
      { key: "NEXT_PUBLIC_AFFILIATE_DISCLOSURE_ENABLED", required: false },
      { key: "COMMERCE_REFRESH_SECRET", required: false, serverOnly: true },
    ],
  },
];

export function checkEnvChecklist(): { categories: { name: string; checks: DeploymentCheck[] }[]; warnings: string[] } {
  const { isProductionDomain } = detectProductionMode();
  const categories: { name: string; checks: DeploymentCheck[] }[] = [];
  const warnings: string[] = [];

  for (const group of ENV_GROUPS) {
    const checks: DeploymentCheck[] = [];

    for (const envVar of group.vars) {
      const value = process.env[envVar.key];
      const present = !!value;

      if (envVar.required && !present) {
        checks.push({ name: envVar.key, status: "fail", message: `${envVar.key} is required but not set` });
      } else if (present) {
        checks.push({ name: envVar.key, status: "pass", message: envVar.serverOnly ? "Set (server-only)" : "Set" });
      } else {
        checks.push({ name: envVar.key, status: "warning", message: "Not set (optional)" });
      }
    }

    categories.push({ name: group.name, checks });
  }

  // Production-specific warnings
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "";
  if (appUrl.includes("localhost") && isProductionDomain) {
    warnings.push("NEXT_PUBLIC_APP_URL is localhost but domain suggests production");
  } else if (appUrl.includes("localhost")) {
    warnings.push("NEXT_PUBLIC_APP_URL is localhost — update for deployment");
  }

  const adminCode = process.env.NEXT_PUBLIC_LOCAL_ADMIN_CODE || "ADMINDEMO";
  if (adminCode === "ADMINDEMO" && isProductionDomain) {
    warnings.push("CRITICAL: Admin code is ADMINDEMO in production environment");
  }

  const demoCode = process.env.NEXT_PUBLIC_DEMO_UNLOCK_CODE || "AURADEMO";
  if (demoCode === "AURADEMO" && isProductionDomain) {
    warnings.push("CRITICAL: Demo unlock code is AURADEMO in production");
  }

  return { categories, warnings };
}
