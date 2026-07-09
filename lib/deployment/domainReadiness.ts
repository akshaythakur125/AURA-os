import type { DeploymentCheck } from "@/types/deployment";
import { detectProductionMode } from "./productionMode";

export const PRODUCTION_DOMAIN = "fixmyaura.shop";

export function getDomainReadiness(): { checks: DeploymentCheck[]; domain: string; configured: boolean } {
  const { appUrl, hostMode, domain } = detectProductionMode();
  const checks: DeploymentCheck[] = [];

  checks.push({
    name: "Current app URL",
    status: "pass",
    message: `App URL: ${appUrl}`,
  });

  checks.push({
    name: "Domain detected",
    status: hostMode === "production" ? "pass" : "warning",
    message: hostMode === "production"
      ? `Production domain detected: ${domain}`
      : `Current domain: ${domain}. Expected production domain: ${PRODUCTION_DOMAIN}`,
  });

  checks.push({
    name: "Domain purchased",
    status: "manual",
    message: `Verify ${PRODUCTION_DOMAIN} is purchased and added to Vercel project`,
  });

  checks.push({
    name: "DNS configured",
    status: "manual",
    message: "Verify DNS records point to Vercel (CNAME or A records configured correctly)",
  });

  checks.push({
    name: "HTTPS active",
    status: appUrl.startsWith("https://") ? "pass" : appUrl.includes("localhost") ? "pass" : "warning",
    message: appUrl.startsWith("https://") ? "HTTPS is active" : "HTTPS not detected — enable in Vercel dashboard",
  });

  checks.push({
    name: "NEXT_PUBLIC_APP_URL set",
    status: appUrl.includes(PRODUCTION_DOMAIN) ? "pass" : "warning",
    message: appUrl.includes(PRODUCTION_DOMAIN)
      ? `APP_URL correctly set to ${appUrl}`
      : `NEXT_PUBLIC_APP_URL should be https://${PRODUCTION_DOMAIN}`,
  });

  checks.push({
    name: "Razorpay webhook URL",
    status: "manual",
    message: `Set Razorpay webhook URL to https://${PRODUCTION_DOMAIN}/api/webhooks/razorpay`,
  });

  checks.push({
    name: "Supabase Site URL",
    status: "manual",
    message: `Set Supabase Auth Site URL to https://${PRODUCTION_DOMAIN}`,
  });

  checks.push({
    name: "Sitemap uses production domain",
    status: "manual",
    message: "Verify sitemap.xml uses production domain URLs",
  });

  return {
    checks,
    domain: PRODUCTION_DOMAIN,
    configured: hostMode === "production",
  };
}
