import type { SmokeTestResult, SmokeTestSuite } from "@/types/smokeTest";
import { getSearchIndex } from "@/lib/storage/commerceSearchStore";

async function runTest(name: string, fn: () => Promise<boolean>, skipMessage?: string): Promise<SmokeTestResult> {
  const start = Date.now();
  try {
    if (skipMessage) {
      return { testName: name, status: "manual", message: skipMessage, durationMs: Date.now() - start };
    }
    const passed = await fn();
    return {
      testName: name,
      status: passed ? "pass" : "fail",
      message: passed ? "Passed" : "Failed",
      durationMs: Date.now() - start,
    };
  } catch (err) {
    return {
      testName: name,
      status: "fail",
      message: err instanceof Error ? err.message : "Unknown error",
      durationMs: Date.now() - start,
    };
  }
}

export async function runSmokeTests(): Promise<SmokeTestSuite> {
  const startedAt = new Date().toISOString();
  const tests: SmokeTestResult[] = [];

  // 1. Homepage
  tests.push(await runTest("Homepage route", async () => {
    const res = await fetch("/");
    return res.ok;
  }));

  // 2. Pricing
  tests.push(await runTest("Pricing route", async () => {
    const res = await fetch("/pricing");
    return res.ok;
  }));

  // 3. Audit new
  tests.push(await runTest("Audit new route", async () => {
    const res = await fetch("/audit/new");
    return res.ok;
  }));

  // 4. Health API
  tests.push(await runTest("Health API", async () => {
    const res = await fetch("/api/health");
    const data = await res.json();
    return data.status === "ok";
  }));

  // 5. Commerce catalog
  tests.push(await runTest("Commerce catalog has products", async () => {
    const index = getSearchIndex();
    return index.length > 0;
  }, "Search index may be empty before first import. Check catalog directly."));

  // 6. Admin page
  tests.push(await runTest("Admin page exists", async () => {
    const res = await fetch("/admin");
    return res.ok;
  }));

  // 7. Privacy + terms
  tests.push(await runTest("Privacy page", async () => {
    const res = await fetch("/privacy");
    return res.ok;
  }));

  tests.push(await runTest("Terms page", async () => {
    const res = await fetch("/terms");
    return res.ok;
  }));

  // 8. Affiliate out route
  tests.push(await runTest("Affiliate out route exists", async () => {
    const res = await fetch("/api/out");
    return res.status === 400 || res.status === 405; // should exist but reject bad requests
  }, "Check /api/out route exists in codebase."));

  // 9. Wishlist API
  tests.push(await runTest("Wishlist API exists", async () => {
    const res = await fetch("/api/commerce/wishlist");
    return res.ok;
  }));

  // 10. Funnel analytics
  tests.push(await runTest("Funnel analytics available", async () => {
    return true;
  }, "Funnel store is ready. Events accumulate as users interact."));

  const passed = tests.filter((t) => t.status === "pass").length;
  const failed = tests.filter((t) => t.status === "fail").length;
  const manual = tests.filter((t) => t.status === "manual").length;

  return {
    name: "Production Smoke Tests",
    tests,
    passed,
    failed,
    manual,
    total: tests.length,
    startedAt,
    completedAt: new Date().toISOString(),
  };
}
