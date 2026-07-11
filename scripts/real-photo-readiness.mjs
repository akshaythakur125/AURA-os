#!/usr/bin/env node
/**
 * ponytail: real-photo readiness — counts only approved/imported, not quarantined.
 * Run: node scripts/real-photo-readiness.mjs
 */

import { existsSync, readdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

function count(dir) {
  if (!existsSync(dir)) return 0;
  return readdirSync(dir).filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f)).length;
}

const quarantined = count("datasets/real-photos/quarantined");
const pending = count("datasets/real-photos/pending-licence-review");
const approved = count("datasets/real-photos/approved");
const imported = count("datasets/real-photos/imported");
const rejected = count("datasets/real-photos/rejected");

let level = "no-real-images";
if (imported > 0) level = "imported-unlabelled";
if (approved > 0 && imported === 0) level = "approved-not-imported";
if (quarantined > 0 && approved === 0) level = "quarantined-only";

console.log(`\n📊 Real-Photo Readiness: ${level}\n`);
console.log(`  Quarantined: ${quarantined}`);
console.log(`  Pending review: ${pending}`);
console.log(`  Approved: ${approved}`);
console.log(`  Imported: ${imported}`);
console.log(`  Rejected: ${rejected}`);

const report = { level, quarantined, pending, approved, imported, rejected, checkedAt: new Date().toISOString() };
writeFileSync("artifacts/benchmarks/real-photo-readiness.json", JSON.stringify(report, null, 2));
