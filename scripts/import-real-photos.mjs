#!/usr/bin/env node
/**
 * ponytail: batch real-photo importer — validates images, checks licence, writes manifest.
 * Run: node scripts/import-real-photos.mjs --source <folder> --manifest <json>
 */

import { readFileSync, writeFileSync, readdirSync, statSync, mkdirSync, existsSync, createHash } from "fs";
import { join, extname } from "path";

const DEST = "datasets/real-photos";
const SUPPORTED = [".jpg", ".jpeg", ".png", ".webp"];

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = {};
  for (let i = 0; i < args.length; i += 2) {
    if (args[i] === "--source") opts.source = args[i + 1];
    if (args[i] === "--manifest") opts.manifest = args[i + 1];
    if (args[i] === "--dry-run") opts.dryRun = true;
  }
  return opts;
}

function validateManifest(records) {
  const errors = [];
  for (let i = 0; i < records.length; i++) {
    const r = records[i];
    if (!r.sourceFile) errors.push(`[${i}] missing sourceFile`);
    if (!r.externalId) errors.push(`[${i}] missing externalId`);
    if (!r.licence) errors.push(`[${i}] missing licence`);
    if (r.licence === "unknown") errors.push(`[${i}] licence unknown — rejected`);
    if (r.commercialEvaluationAllowed === false) errors.push(`[${i}] commercial evaluation not allowed`);
    if (!existsSync(r.sourceFile)) errors.push(`[${i}] file not found: ${r.sourceFile}`);
    const ext = extname(r.sourceFile).toLowerCase();
    if (!SUPPORTED.includes(ext)) errors.push(`[${i}] unsupported format: ${ext}`);
  }
  return errors;
}

function checksum(file) {
  return createHash("sha256").update(readFileSync(file)).digest("hex");
}

async function run() {
  const opts = parseArgs();
  if (!opts.source || !opts.manifest) {
    console.error("Usage: node scripts/import-real-photos.mjs --source <folder> --manifest <manifest.json>");
    process.exit(1);
  }

  const manifest = JSON.parse(readFileSync(opts.manifest, "utf-8"));
  const records = Array.isArray(manifest) ? manifest : manifest.images || [];

  console.log(`\n📥 Real-Photo Import — ${records.length} records\n`);

  // Validate manifest
  const errors = validateManifest(records);
  if (errors.length > 0) {
    console.error("❌ Manifest validation failed:");
    errors.forEach(e => console.error(`  ${e}`));
    process.exit(1);
  }
  console.log(`✅ Manifest valid — ${records.length} records`);

  if (opts.dryRun) {
    console.log("\n🔍 Dry run — no files copied");
    return;
  }

  // Import
  mkdirSync(DEST, { recursive: true });
  const imported = [];
  const rejected = [];

  for (const r of records) {
    try {
      const buf = readFileSync(r.sourceFile);
      const hash = checksum(r.sourceFile);
      const ext = extname(r.sourceFile).toLowerCase();
      const outName = `${r.externalId}${ext}`;
      const outPath = join(DEST, outName);

      if (existsSync(outPath)) {
        rejected.push({ ...r, reason: "duplicate" });
        continue;
      }

      writeFileSync(outPath, buf);
      imported.push({ ...r, importedPath: outPath, checksum: hash, importedAt: new Date().toISOString() });
    } catch (e) {
      rejected.push({ ...r, reason: e.message });
    }
  }

  // Write import report
  mkdirSync("artifacts/benchmarks", { recursive: true });
  const report = { timestamp: new Date().toISOString(), total: records.length, imported: imported.length, rejected: rejected.length, imported, rejected };
  writeFileSync("artifacts/benchmarks/real-photo-import.json", JSON.stringify(report, null, 2));

  console.log(`\n📊 Results: ${imported.length} imported, ${rejected.length} rejected`);
  if (rejected.length > 0) {
    console.log("Rejected:");
    rejected.forEach(r => console.log(`  ${r.externalId}: ${r.reason}`));
  }
}

run().catch(e => { console.error("❌", e.message); process.exit(1); });
