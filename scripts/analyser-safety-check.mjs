#!/usr/bin/env node
/**
 * ponytail: analyser safety check — fails if prohibited patterns exist in production analyser code.
 * Run: node scripts/analyser-safety-check.mjs
 */

import { readdirSync, readFileSync, statSync } from "fs";
import { join, extname } from "path";

const SRC_DIR = "src/lib/aura-engine";

// Patterns that should NEVER appear in production analyser output templates
const PROHIBITED_PATTERNS = [
  { pattern: /Math\.random\(\)/, label: "Math.random() in analyser" },
  { pattern: /status\s*leak/i, label: "Prohibited term: status leak" },
  { pattern: /celebrity\s*benchmark/i, label: "Prohibited term: celebrity benchmark" },
  { pattern: /irresistible|magnetic|forgettable/i, label: "Prohibited manipulative term" },
  { pattern: /fake.*countdown|today\s*only|last\s*chance/i, label: "Fake urgency" },
  { pattern: /boost.*aura|improve.*by.*\d+\s*point/i, label: "Score improvement promise" },
];

// Files to skip (type definitions, shop link handlers, measurement fallbacks)
const SKIP_FILES = ["types.ts", "reportTemplates.ts", "productLinks.ts"];

const violations = [];

function checkFile(filePath) {
  const fileName = filePath.split(/[\\/]/).pop() || "";
  if (SKIP_FILES.some((s) => fileName.includes(s))) return;

  const content = readFileSync(filePath, "utf-8");
  const lines = content.split("\n");
  for (const { pattern, label } of PROHIBITED_PATTERNS) {
    for (let i = 0; i < lines.length; i++) {
      if (pattern.test(lines[i])) {
        if (lines[i].trim().startsWith("//") || lines[i].trim().startsWith("*")) continue;
        if (lines[i].trim().startsWith("import") || lines[i].trim().startsWith("export type")) continue;
        if (lines[i].includes("StatusLeak") || lines[i].includes("statusLeaks")) continue;
        violations.push({ file: filePath, line: i + 1, label, content: lines[i].trim().slice(0, 80) });
      }
    }
  }
}

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      walk(full);
    } else if (extname(full) === ".ts" || extname(full) === ".tsx") {
      checkFile(full);
    }
  }
}

walk(SRC_DIR);

if (violations.length > 0) {
  console.error("\n❌ ANALYSER SAFETY CHECK FAILED\n");
  for (const v of violations) {
    console.error(`  ${v.file}:${v.line} — ${v.label}`);
    console.error(`    ${v.content}\n`);
  }
  process.exit(1);
} else {
  console.log("✅ Analyser safety check passed — no prohibited patterns found");
}
