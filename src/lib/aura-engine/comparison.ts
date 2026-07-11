/**
 * Compare two analyser outputs for baseline-vs-candidate evaluation.
 */

export type AnalyserOutput = {
  versions: Record<string, string>;
  overallScore: number | null;
  status: string;
  qualityGate: { canProceed: boolean; qualityScore: number };
  durationMs: number;
  measurements: Record<string, unknown>;
};

export type ComparisonResult = {
  versionDifferences: string[];
  overallScoreDiff: number | null;
  statusChanged: boolean;
  qualityGateChanged: boolean;
  measurementDifferences: string[];
  timingDiffMs: number;
};

export function compareAnalyserOutputs(baseline: AnalyserOutput, candidate: AnalyserOutput): ComparisonResult {
  const versionDifferences: string[] = [];
  const measurementDifferences: string[] = [];

  for (const key of Object.keys(baseline.versions)) {
    if (baseline.versions[key] !== candidate.versions[key]) {
      versionDifferences.push(`${key}: ${baseline.versions[key]} -> ${candidate.versions[key]}`);
    }
  }

  const overallScoreDiff =
    baseline.overallScore !== null && candidate.overallScore !== null
      ? candidate.overallScore - baseline.overallScore
      : null;

  const allKeys: string[] = [];
  for (const k of Object.keys(baseline.measurements)) if (!allKeys.includes(k)) allKeys.push(k);
  for (const k of Object.keys(candidate.measurements)) if (!allKeys.includes(k)) allKeys.push(k);

  for (const key of allKeys) {
    const bv = baseline.measurements[key];
    const cv = candidate.measurements[key];
    if (JSON.stringify(bv) !== JSON.stringify(cv)) {
      measurementDifferences.push(`${key}: ${JSON.stringify(bv)} -> ${JSON.stringify(cv)}`);
    }
  }

  return {
    versionDifferences,
    overallScoreDiff,
    statusChanged: baseline.status !== candidate.status,
    qualityGateChanged: baseline.qualityGate.canProceed !== candidate.qualityGate.canProceed,
    measurementDifferences,
    timingDiffMs: candidate.durationMs - baseline.durationMs,
  };
}

export function formatComparisonMarkdown(result: ComparisonResult): string {
  const lines: string[] = ["## Analyser Comparison\n"];
  if (result.versionDifferences.length) {
    lines.push("### Version Differences");
    for (const d of result.versionDifferences) lines.push(`- ${d}`);
  }
  lines.push(`\n### Overall Score Diff: ${result.overallScoreDiff === null ? "N/A" : result.overallScoreDiff}`);
  lines.push(`### Status Changed: ${result.statusChanged}`);
  lines.push(`### Quality Gate Changed: ${result.qualityGateChanged}`);
  lines.push(`### Timing Diff: ${Math.round(result.timingDiffMs)}ms`);
  if (result.measurementDifferences.length) {
    lines.push("\n### Measurement Differences");
    for (const d of result.measurementDifferences) lines.push(`- ${d}`);
  }
  return lines.join("\n");
}
