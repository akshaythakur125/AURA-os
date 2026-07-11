#!/usr/bin/env node
/**
 * ponytail: security test — verifies no external API calls in analyser code.
 * Run: node scripts/test-no-external-analysis.mjs
 */

import { readFileSync, readdirSync } from "fs";
import { join } from "path";

const ANALYSER_DIRS = ["src/lib/aura-engine", "src/lib/vision"];
const FORBIDDEN = [
  /fetch\(/,
  /axios/,
  /XMLHttpRequest/,
  /openai/i,
  /anthropic/i,
  /gemini/i,
  // replicate is a common English word — skip
  /huggingface\.co\/api/i,
  /api\.openai\.com/i,
  /api\.anthropic\.com/i,
  /vision\.googleapis/i,
  /rekognition/i,
  /azure.*vision/i,
  /clarifai/i,
];

let issues = 0;

for (const dir of ANALYSER_DIRS) {
  const files = readdirSync(dir, { recursive: true }).filter(f => f.endsWith(".ts") || f.endsWith(".tsx"));
  for (const file of files) {
    const path = join(dir, file);
    const content = readFileSync(path, "utf-8");
    for (const pattern of FORBIDDEN) {
      const match = content.match(pattern);
      if (match) {
        // Allow fetch() only if it's not in the analyser path
        if (match[0] === "fetch(" && !content.includes("fetch(")) continue;
        console.error(`❌ ${path}: found "${match[0]}"`);
        issues++;
      }
    }
  }
}

if (issues > 0) {
  console.error(`\n❌ ${issues} external API references found`);
  process.exit(1);
}
console.log("✅ No external API calls in analyser code");
