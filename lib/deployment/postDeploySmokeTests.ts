import type { PostDeployResult } from "@/types/deployment";
import { isSupabaseConfigured } from "@/lib/storage/storageMode";
import { isRazorpayConfigured } from "@/lib/razorpay/env";

async function runTest(name: string, fn: () => Promise<boolean>, skipMsg?: string): Promise<PostDeployResult> {
  const start = Date.now();
  try {
    if (skipMsg) {
      return { testName: name, status: "manual", message: skipMsg, durationMs: Date.now() - start };
    }
    const passed = await fn();
    return { testName: name, status: passed ? "pass" : "fail", message: passed ? "Passed" : "Failed", durationMs: Date.now() - start };
  } catch (err) {
    return { testName: name, status: "fail", message: err instanceof Error ? err.message : "Error", durationMs: Date.now() - start };
  }
}

export async function runPostDeploySmokeTests(): Promise<{
  tests: PostDeployResult[]; passed: number; failed: number; manual: number; total: number;
}> {
  const tests: PostDeployResult[] = [];

  tests.push(await runTest("Homepage (/)", async () => {
    const res = await fetch(typeof window !== "undefined" ? "/" : "http://localhost:3000");
    return res.ok;
  }));

  tests.push(await runTest("Pricing (/pricing)", async () => {
    const res = await fetch("/pricing");
    return res.ok;
  }));

  tests.push(await runTest("Audit New (/audit/new)", async () => {
    const res = await fetch("/audit/new");
    return res.ok;
  }));

  tests.push(await runTest("Health API (/api/health)", async () => {
    const res = await fetch("/api/health");
    const data = await res.json();
    return data.status === "ok";
  }));

  tests.push(await runTest("Privacy (/privacy)", async () => {
    const res = await fetch("/privacy");
    return res.ok;
  }));

  tests.push(await runTest("Terms (/terms)", async () => {
    const res = await fetch("/terms");
    return res.ok;
  }));

  tests.push(await runTest("Wardrobe Search (/wardrobe/search)", async () => {
    const res = await fetch("/wardrobe/search");
    return res.ok;
  }));

  tests.push(await runTest("Admin gated (/admin/launch)", async () => {
    const res = await fetch("/admin/launch");
    return res.ok; // Should return admin gate page, not crash
  }));

  tests.push(await runTest("Razorpay configured", async () => {
    return isRazorpayConfigured();
  }, "Razorpay may not be configured in all environments"));

  tests.push(await runTest("Supabase configured", async () => {
    return isSupabaseConfigured();
  }, "Supabase may not be configured in all environments"));

  const passed = tests.filter((t) => t.status === "pass").length;
  const failed = tests.filter((t) => t.status === "fail").length;
  const manual = tests.filter((t) => t.status === "manual").length;

  return { tests, passed, failed, manual, total: tests.length };
}
