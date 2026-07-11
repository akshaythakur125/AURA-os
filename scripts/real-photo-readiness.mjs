#!/usr/bin/env node
/**
 * ponytail: real-photo readiness tracker — checks current state.
 * Run: node scripts/real-photo-readiness.mjs
 */

import { existsSync, readdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

const REAL_DIR = "datasets/real-photos";
const ANNOTATIONS_KEY = "aura_annotations";

let realCount = 0;
if (existsSync(REAL_DIR)) {
  realCount = readdirSync(REAL_DIR).filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f)).length;
}

// Check annotation state
let annotationCount = 0;
try {
  // Can't read localStorage from Node.js — check if any annotation files exist
  const annotFiles = readdirSync("artifacts/benchmarks").filter(f => f.includes("annotation"));
  annotationCount = annotFiles.length;
} catch { /* ignore */ }

let level = "no-real-images";
if (realCount > 0 && annotationCount === 0) level = "imported-unlabelled";
else if (realCount > 0 && annotationCount > 0) level = "partially-labelled";

console.log(`\n📊 Real-Photo Readiness: ${level}\n`);
console.log(`  Real photographs: ${realCount}`);
console.log(`  Annotation files: ${annotationCount}`);
console.log(`  Target: 500 labelled images for validation-ready`);
console.log(`  Blocked until: approved real-photo dataset is provided`);

writeFileSync("artifacts/benchmarks/real-photo-readiness.json", JSON.stringify({ level, realImageCount: realCount, annotationFiles: annotationCount, checkedAt: new Date().toISOString() }, null, 2));
