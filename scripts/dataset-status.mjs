#!/usr/bin/env node
/**
 * ponytail: dataset status — shows which datasets are configured and available.
 * Run: node scripts/dataset-status.mjs
 */

import { readFileSync, existsSync, statSync } from "fs";
import { join } from "path";

const registry = JSON.parse(readFileSync("datasets/registry/datasets.json", "utf-8"));
const DATASET_DIR = "datasets/raw";

console.log("\n📊 Dataset Registry Status\n");
console.log(`Registry version: ${registry.version}`);
console.log(`Datasets: ${registry.datasets.length}\n`);

for (const ds of registry.datasets) {
  const localPath = join(DATASET_DIR, ds.id);
  const exists = existsSync(localPath);
  let fileCount = 0;
  if (exists) {
    try {
      const entries = (await import("fs")).readdirSync(localPath);
      fileCount = entries.length;
    } catch { /* ignore */ }
  }

  const status = exists ? `✅ available (${fileCount} files)` : ds.downloadMethod === "manual" ? "📥 manual download required" : "⚠️ not downloaded";
  const licence = ds.licenceStatus === "approved" ? "🟢 approved" : ds.licenceStatus === "research-only" ? "🟡 research-only" : "🔴 review required";

  console.log(`  ${ds.id}: ${status}`);
  console.log(`    Purpose: ${ds.purpose.join(", ")}`);
  console.log(`    Licence: ${licence}`);
  console.log(`    Source: ${ds.officialSource}`);
  if (ds.notes.length) console.log(`    Note: ${ds.notes[0]}`);
  console.log("");
}
