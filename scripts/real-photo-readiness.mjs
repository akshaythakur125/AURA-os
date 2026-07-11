#!/usr/bin/env node
/**
 * ponytail: readiness — separates acquisition state from benchmark readiness.
 * Run: node scripts/real-photo-readiness.mjs
 */

import { existsSync, readdirSync, writeFileSync } from "fs";

function count(dir) { return existsSync(dir) ? readdirSync(dir).filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f)).length : 0; }

const discovered = count("datasets/real-photos/quarantined") + count("datasets/real-photos/pending-licence-review") + count("datasets/real-photos/rejected");
const quarantined = count("datasets/real-photos/quarantined");
const pending = count("datasets/real-photos/pending-licence-review");
const approved = count("datasets/real-photos/approved");
const imported = count("datasets/real-photos/imported");
const rejected = count("datasets/real-photos/rejected");

// Acquisition readiness
let acq = "empty";
if (quarantined + pending > 0) acq = "quarantined-only";
if (approved > 0) acq = "approved-candidates-available";

// Benchmark readiness (separate — only counts approved + imported)
let bench = "no-real-images";
if (imported > 0) bench = "imported-unlabelled";

console.log(`\n📊 Readiness Report\n`);
console.log(`  Acquisition: ${acq}`);
console.log(`  Benchmark:   ${bench}`);
console.log(`  Quarantined: ${quarantined}`);
console.log(`  Pending review: ${pending}`);
console.log(`  Approved: ${approved}`);
console.log(`  Imported: ${imported}`);
console.log(`  Rejected: ${rejected}`);

writeFileSync("artifacts/benchmarks/real-photo-readiness.json", JSON.stringify({
  acquisitionReadiness: acq, benchmarkReadiness: bench,
  quarantined, pending, approved, imported, rejected,
  checkedAt: new Date().toISOString(),
}, null, 2));
