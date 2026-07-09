import type { LaunchCheck } from "@/types/launch";

export function checkDomainHealth(): { checks: LaunchCheck[] } {
  const checks: LaunchCheck[] = [];

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "";

  checks.push({
    name: "App URL configured",
    status: appUrl ? "pass" : "fail",
    message: appUrl ? `App URL: ${appUrl}` : "NEXT_PUBLIC_APP_URL not set",
  });

  if (appUrl) {
    const isLocalhost = appUrl.includes("localhost") || appUrl.includes("127.0.0.1");
    checks.push({
      name: "Production URL",
      status: isLocalhost ? "warning" : "pass",
      message: isLocalhost ? "App URL is localhost — not suitable for production" : "App URL looks like a production URL",
    });

    if (!isLocalhost) {
      checks.push({
        name: "HTTPS enabled",
        status: appUrl.startsWith("https://") ? "pass" : "warning",
        message: appUrl.startsWith("https://") ? "App URL uses HTTPS" : "App URL does not use HTTPS — required for production",
      });
    }
  }

  checks.push({
    name: "Domain DNS",
    status: "manual",
    message: "Verify domain DNS points to Vercel and SSL certificate is valid",
  });

  checks.push({
    name: "Vercel deployment",
    status: "manual",
    message: "Confirm latest build deploys successfully on Vercel",
  });

  return { checks };
}
