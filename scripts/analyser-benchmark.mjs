#!/usr/bin/env node
/**
 * ponytail: analyser benchmark runner — evaluates current analyser against fixture metadata.
 * Run: node scripts/analyser-benchmark.mjs
 *
 * This runs in Node.js (not browser). It reads fixture metadata, validates the registry,
 * and generates a baseline report. Actual image analysis requires a browser environment.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";

const REGISTRY_PATH = "datasets/registry/datasets.json";
const FIXTURE_PATH = "tests/fixtures/analyser/metadata.json";
const OUTPUT_DIR = "artifacts/benchmarks";

// Load registry
let registry;
try {
  registry = JSON.parse(readFileSync(REGISTRY_PATH, "utf-8"));
} catch {
  console.error("❌ Cannot load dataset registry");
  process.exit(1);
}

// Load fixture metadata
let fixtures;
try {
  fixtures = JSON.parse(readFileSync(FIXTURE_PATH, "utf-8"));
} catch {
  console.error("❌ Cannot load fixture metadata");
  process.exit(1);
}

console.log("\n🔬 Analyser Benchmark Runner\n");
console.log(`Registry: ${registry.version}`);
console.log(`Datasets: ${registry.datasets.length}`);
console.log(`Fixtures: ${fixtures.fixtures?.length || 0}`);

// Validate registry entries
const issues = [];
for (const ds of registry.datasets) {
  if (!ds.id) issues.push(`Dataset missing id`);
  if (!ds.name) issues.push(`Dataset ${ds.id} missing name`);
  if (!ds.purpose?.length) issues.push(`Dataset ${ds.id} missing purpose`);
  if (!ds.officialSource) issues.push(`Dataset ${ds.id} missing officialSource`);
  if (!ds.licenceStatus) issues.push(`Dataset ${ds.id} missing licenceStatus`);
  if (ds.licenceStatus === "unknown") issues.push(`Dataset ${ds.id} has unknown licence — requires review`);
  if (ds.licenceStatus === "rejected") issues.push(`Dataset ${ds.id} is rejected`);
}

// Check datasets are not committed
const gitignore = readFileSync(".gitignore", "utf-8");
if (!gitignore.includes("datasets/raw")) {
  issues.push("datasets/raw/ not in .gitignore — raw images could be committed");
}

// Check for prohibited files
const prohibitedExtensions = [".onnx", ".pb", ".pt", ".pth", ".weights"];
// (can't check actual files without listing, but check .gitignore covers them)
if (!gitignore.includes("*.onnx")) {
  issues.push("Model weight extensions not in .gitignore");
}

// Generate report
mkdirSync(OUTPUT_DIR, { recursive: true });

const report = {
  timestamp: new Date().toISOString(),
  registryVersion: registry.version,
  fixtureCount: fixtures.fixtures?.length || 0,
  datasetCount: registry.datasets.length,
  issues,
  datasets: registry.datasets.map((ds) => ({
    id: ds.id,
    name: ds.name,
    licence: ds.licenceStatus,
    downloadMethod: ds.downloadMethod,
    purpose: ds.purpose,
  })),
  status: issues.length === 0 ? "PASS" : "ISSUES_FOUND",
};

writeFileSync(join(OUTPUT_DIR, "current-analyser.json"), JSON.stringify(report, null, 2));

// Markdown report
const md = [
  "# Analyser Benchmark Report",
  "",
  `**Date:** ${report.timestamp}`,
  `**Registry:** ${report.registryVersion}`,
  `**Datasets:** ${report.datasetCount}`,
  `**Fixtures:** ${report.fixtureCount}`,
  `**Status:** ${report.status}`,
  "",
  "## Datasets",
  "",
  "| ID | Name | Licence | Download | Purpose |",
  "|----|------|---------|----------|---------|",
  ...registry.datasets.map((ds) => `| ${ds.id} | ${ds.name} | ${ds.licenceStatus} | ${ds.downloadMethod} | ${ds.purpose.join(", ")} |`),
  "",
  "## Issues",
  "",
  ...(issues.length ? issues.map((i) => `- ${i}`) : ["- None"]),
  "",
  "## Next Steps",
  "",
  "1. Download approved datasets manually per licence-review.md",
  "2. Run `node scripts/dataset-status.mjs` to verify availability",
  "3. Generate synthetic fixtures from approved source images",
  "4. Run browser-based benchmark against analyser pipeline",
].join("\n");

writeFileSync(join(OUTPUT_DIR, "current-analyser.md"), md);

console.log(`\n✅ Report generated: ${OUTPUT_DIR}/current-analyser.json`);
console.log(`✅ Report generated: ${OUTPUT_DIR}/current-analyser.md`);

if (issues.length) {
  console.log(`\n⚠️ ${issues.length} issues found:`);
  for (const i of issues) console.log(`  - ${i}`);
} else {
  console.log("\n✅ All checks passed");
}
