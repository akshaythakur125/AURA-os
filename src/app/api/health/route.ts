import { NextResponse } from "next/server";

// ponytail: health check — returns basic status, no secrets

export const dynamic = "force-dynamic";

export async function GET() {
  const checks: Record<string, string> = {
    status: "ok",
    timestamp: new Date().toISOString(),
    node: process.version,
  };

  // Check env vars exist (not values)
  const required = ["RAZORPAY_KEY_ID", "RAZORPAY_KEY_SECRET"];
  for (const key of required) {
    checks[key] = process.env[key] ? "set" : "missing";
  }

  const hasIssues = Object.values(checks).includes("missing");

  return NextResponse.json(checks, { status: hasIssues ? 503 : 200 });
}
