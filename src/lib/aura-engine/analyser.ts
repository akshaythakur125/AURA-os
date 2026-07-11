/**
 * Centralized analyser entry point.
 * All real image analyses must pass through here.
 * UI components consume this output — they never recalculate scores.
 */

import { analyzeImageDataUrl } from "./imageMetrics";
import { calculateAuraScore, determineCategory, generateVerdict } from "./scoring";
import { getAllVersions } from "./versions";
import type { AuditGoal, ImageSignalMetrics } from "@/types/audit";

export type AnalysisInput = {
  imageDataUrl: string;
  goal: AuditGoal;
  auditType?: string;
  budgetRange?: number;
};

export type AnalysisOutput = {
  versions: ReturnType<typeof getAllVersions>;
  goal: AuditGoal;
  status: "completed" | "rejected" | "failed";
  imageMetrics: ImageSignalMetrics | null;
  overallScore: number | null;
  category: string;
  verdict: string;
  qualityGate: {
    passed: boolean;
    canProceed: boolean;
    qualityScore: number;
    message: string;
    issues: string[];
  };
  durationMs: number;
};

/**
 * Run the complete analysis pipeline.
 * Same input → same output (deterministic, no randomness).
 * UI components must consume this output, not recalculate.
 */
export async function runAnalysis(input: AnalysisInput): Promise<AnalysisOutput> {
  const start = performance.now();
  const versions = getAllVersions();

  try {
    const metrics = await analyzeImageDataUrl(input.imageDataUrl);

    // Quality gate check
    if (metrics.qualityGate && !metrics.qualityGate.canProceed) {
      return {
        versions,
        goal: input.goal,
        status: "rejected",
        imageMetrics: metrics,
        overallScore: null,
        category: "Insufficient Quality",
        verdict: metrics.qualityGate.message,
        qualityGate: {
          passed: metrics.qualityGate.qualityScore >= 50,
          canProceed: false,
          qualityScore: metrics.qualityGate.qualityScore,
          message: metrics.qualityGate.message,
          issues: metrics.qualityGate.issues as string[],
        },
        durationMs: performance.now() - start,
      };
    }

    // Score calculation — ONE formula, ONE place
    const score = calculateAuraScore({
      auditType: (input.auditType as any) || "photo",
      goal: input.goal,
      budgetRange: input.budgetRange || 0,
      metrics,
    });

    const category = determineCategory(score, metrics);
    const verdict = generateVerdict(score, category);

    return {
      versions,
      goal: input.goal,
      status: "completed",
      imageMetrics: metrics,
      overallScore: score,
      category,
      verdict,
      qualityGate: {
        passed: (metrics.qualityGate?.qualityScore ?? 100) >= 50,
        canProceed: metrics.qualityGate?.canProceed ?? true,
        qualityScore: metrics.qualityGate?.qualityScore ?? 100,
        message: metrics.qualityGate?.message ?? "",
        issues: (metrics.qualityGate?.issues as string[]) ?? [],
      },
      durationMs: performance.now() - start,
    };
  } catch (err) {
    return {
      versions,
      goal: input.goal,
      status: "failed",
      imageMetrics: null,
      overallScore: null,
      category: "Analysis Failed",
      verdict: "Unable to analyse this image. Please try again with a different photo.",
      qualityGate: {
        passed: false,
        canProceed: false,
        qualityScore: 0,
        message: err instanceof Error ? err.message : "Analysis failed",
        issues: [],
      },
      durationMs: performance.now() - start,
    };
  }
}
