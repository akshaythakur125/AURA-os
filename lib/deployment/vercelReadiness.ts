import type { DeploymentCheck } from "@/types/deployment";

export function getVercelReadiness(): { checks: DeploymentCheck[]; isVercel: boolean } {
  const checks: DeploymentCheck[] = [];
  const isVercel = !!process.env.VERCEL;

  checks.push({
    name: "Vercel environment detected",
    status: isVercel ? "pass" : "pass",
    message: isVercel ? "Running on Vercel" : "Not detected as Vercel environment (expected during local dev)",
  });

  checks.push({
    name: "Vercel URL",
    status: isVercel ? "pass" : "manual",
    message: isVercel
      ? `Preview URL: ${process.env.VERCEL_URL || "available"}`
      : "Check Vercel dashboard for deployment URL",
  });

  if (isVercel) {
    checks.push({
      name: "Build configuration",
      status: "manual",
      message: "Verify Vercel build settings: Framework=Next.js, Build Command=npm run build, Output=Next.js default",
    });
  }

  checks.push({
    name: "Git integration",
    status: "manual",
    message: "Verify GitHub repository is connected to Vercel project with main branch as production",
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "";
  if (appUrl && !appUrl.includes("localhost")) {
    checks.push({
      name: "Domain connected",
      status: "manual",
      message: `${appUrl} should be connected in Vercel dashboard`,
    });
  }

  return { checks, isVercel };
}
