import { NextRequest, NextResponse } from "next/server";
import { checkEnvChecklist } from "@/lib/deployment/envChecklist";
import { getVercelReadiness } from "@/lib/deployment/vercelReadiness";
import { getDomainReadiness } from "@/lib/deployment/domainReadiness";
import { detectProductionMode } from "@/lib/deployment/productionMode";
import type { DeploymentChecklist, DeploymentCategory } from "@/types/deployment";
import { isAuthenticated } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
  }

  try {
    const envResult = checkEnvChecklist();
    const vercelResult = getVercelReadiness();
    const domainResult = getDomainReadiness();
    const mode = detectProductionMode();

    const categories: DeploymentCategory[] = [
      { name: "Environment Variables", score: 0, maxScore: 25, checks: envResult.categories.flatMap((c) => c.checks) },
      { name: "Vercel Setup", score: 0, maxScore: 15, checks: vercelResult.checks },
      { name: "Domain & DNS", score: 0, maxScore: 20, checks: domainResult.checks },
      { name: "Production Mode", score: 0, maxScore: 10, checks: [
        { name: "Host mode", status: mode.hostMode === "production" ? "pass" : mode.hostMode === "preview" ? "warning" : "pass", message: `Current mode: ${mode.hostMode} (${mode.domain})` },
        { name: "Production warnings", status: envResult.warnings.length === 0 ? "pass" : "warning", message: `${envResult.warnings.length} warnings` },
      ]},
    ];

    // Compute scores
    for (const cat of categories) {
      let score = 0;
      for (const check of cat.checks) {
        if (check.status === "pass") score += Math.round(cat.maxScore / cat.checks.length);
        else if (check.status === "warning") score += Math.round(cat.maxScore / cat.checks.length * 0.5);
        else if (check.status === "manual") score += Math.round(cat.maxScore / cat.checks.length * 0.3);
      }
      cat.score = Math.min(cat.maxScore, score);
    }

    const totalScore = Math.round(
      categories.reduce((s, c) => s + c.score, 0) / categories.reduce((s, c) => s + c.maxScore, 0) * 100
    );

    const criticalBlockers = categories.flatMap((c) => c.checks).filter((c) => c.status === "fail");

    return NextResponse.json({
      success: true,
      deployment: {
        categories,
        score: totalScore,
        label: totalScore >= 90 ? "production_ready" : totalScore >= 75 ? "soft_launch_ready" : totalScore >= 50 ? "preview_ready" : "not_ready",
        criticalBlockers,
      } as DeploymentChecklist,
      mode,
      warnings: envResult.warnings,
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : "Check failed" }, { status: 500 });
  }
}
