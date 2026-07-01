import type { SecurityCheck } from "@/types/security";

export function auditEnvSecurity(): SecurityCheck[] {
  const checks: SecurityCheck[] = [];

  // Check admin code
  const adminCode = process.env.NEXT_PUBLIC_LOCAL_ADMIN_CODE || "ADMINDEMO";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "";
  const isLocalhost = appUrl.includes("localhost") || appUrl.includes("127.0.0.1");

  if (adminCode === "ADMINDEMO" && !isLocalhost) {
    checks.push({ name: "Admin code default", status: "fail", message: "ADMINDEMO is the default admin code. Change before production." });
  } else if (adminCode === "ADMINDEMO") {
    checks.push({ name: "Admin code default", status: "warning", message: "ADMINDEMO is the default admin code. Change before going to production." });
  } else {
    checks.push({ name: "Admin code", status: "pass", message: "Custom admin code is set." });
  }

  // Server admin code
  const serverAdminCode = process.env.LOCAL_ADMIN_CODE;
  checks.push({
    name: "Server admin code (LOCAL_ADMIN_CODE)",
    status: serverAdminCode ? "pass" : "warning",
    message: serverAdminCode ? "Server admin code is set." : "LOCAL_ADMIN_CODE not set. NEXT_PUBLIC_LOCAL_ADMIN_CODE will be used.",
  });

  // Demo unlock code
  const demoCode = process.env.NEXT_PUBLIC_DEMO_UNLOCK_CODE || "AURADEMO";
  if (demoCode === "AURADEMO" && !isLocalhost) {
    checks.push({ name: "Demo unlock code", status: "warning", message: "Demo unlock code is default AURADEMO. Change before production." });
  }

  // Razorpay
  const razorpaySecret = process.env.RAZORPAY_KEY_SECRET;
  const razorpayWebhook = process.env.RAZORPAY_WEBHOOK_SECRET;
  checks.push({
    name: "Razorpay key secret",
    status: razorpaySecret ? "pass" : "fail",
    message: razorpaySecret ? "RAZORPAY_KEY_SECRET is set." : "RAZORPAY_KEY_SECRET missing — payment verification will fail.",
  });
  checks.push({
    name: "Razorpay webhook secret",
    status: razorpayWebhook ? "pass" : "warning",
    message: razorpayWebhook ? "RAZORPAY_WEBHOOK_SECRET is set." : "RAZORPAY_WEBHOOK_SECRET missing — webhook recovery not available.",
  });

  // Service role key
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
  checks.push({
    name: "Supabase service role key",
    status: serviceRole ? "pass" : "warning",
    message: serviceRole ? "Service role key is set." : "Service role key not set — some server operations limited.",
  });

  // Refresh secret
  const refreshSecret = process.env.COMMERCE_REFRESH_SECRET;
  checks.push({
    name: "Commerce refresh secret",
    status: refreshSecret ? "pass" : "pass",
    message: refreshSecret ? "COMMERCE_REFRESH_SECRET is set." : "COMMERCE_REFRESH_SECRET not set — cron-triggered refresh disabled.",
  });

  // Support
  const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL;
  checks.push({
    name: "Support email",
    status: supportEmail ? "pass" : "warning",
    message: supportEmail ? "Support email is set." : "NEXT_PUBLIC_SUPPORT_EMAIL not set.",
  });

  return checks;
}
