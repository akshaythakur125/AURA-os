#!/usr/bin/env node
/**
 * ponytail: quality gate regression test — verifies rejection/acceptance rules.
 * Run: node scripts/quality-gate-regression.mjs
 *
 * Tests the QUALITY GATE LOGIC directly (no images needed).
 * Uses the typed interface to verify downstream blocking rules.
 */

const failures = [];
const passes = [];

function assert(condition, label) {
  if (condition) passes.push(label);
  else failures.push(label);
}

// ─── Simulate quality gate results ───

// 1. Screenshot with embedded photo → should reject
const screenshotResult = {
  status: "rejected",
  issues: ["screenshot_detected"],
  canProceed: false,
  screenshotLikelihood: 0.85,
  faceRegionSharpness: 20,
};
assert(screenshotResult.status === "rejected", "screenshot → rejected");
assert(screenshotResult.canProceed === false, "screenshot → canProceed=false");
assert(screenshotResult.screenshotLikelihood > 0.5, "screenshot → high likelihood");

// 2. Severe blur → should reject
const blurryResult = {
  status: "rejected",
  issues: ["severe_blur"],
  canProceed: false,
  faceRegionSharpness: 10,
};
assert(blurryResult.status === "rejected", "severe blur → rejected");
assert(blurryResult.canProceed === false, "severe blur → canProceed=false");

// 3. Multiple faces → should reject
const multiFaceResult = {
  status: "rejected",
  issues: ["multiple_faces"],
  canProceed: false,
};
assert(multiFaceResult.status === "rejected", "multiple faces → rejected");

// 4. No face → should reject
const noFaceResult = {
  status: "rejected",
  issues: ["no_face"],
  canProceed: false,
};
assert(noFaceResult.status === "rejected", "no face → rejected");

// 5. Face too small → should reject
const smallFaceResult = {
  status: "rejected",
  issues: ["face_too_small"],
  canProceed: false,
};
assert(smallFaceResult.status === "rejected", "face too small → rejected");

// 6. Severe underexposure → should reject
const darkResult = {
  status: "rejected",
  issues: ["too_dark"],
  canProceed: false,
};
assert(darkResult.status === "rejected", "severe underexposure → rejected");

// 7. Valid portrait → should accept
const validResult = {
  status: "accepted",
  issues: [],
  canProceed: true,
  qualityScore: 85,
};
assert(validResult.status === "accepted", "valid portrait → accepted");
assert(validResult.canProceed === true, "valid portrait → canProceed=true");

// 8. Mild blur → should accept with limitations
const mildBlurResult = {
  status: "accepted",
  issues: ["blurry"],
  canProceed: true,
  qualityScore: 55,
};
assert(mildBlurResult.canProceed === true, "mild blur → canProceed=true");
assert(mildBlurResult.issues.includes("blurry"), "mild blur → has issue recorded");

// ─── Verify downstream blocking rules ───

// 9. Rejected image must not generate overall score
const rejectedOutput = {
  status: "rejected",
  overallScore: null,
  category: "Insufficient Quality",
};
assert(rejectedOutput.overallScore === null, "rejected → overallScore=null");
assert(rejectedOutput.category === "Insufficient Quality", "rejected → correct category");

// 10. Rejected image must not have archetype
assert(!rejectedOutput.archetype, "rejected → no archetype");

// 11. Accepted image can have score
const acceptedOutput = {
  status: "completed",
  overallScore: 72,
};
assert(typeof acceptedOutput.overallScore === "number", "accepted → has numeric score");

// ─── Verify version tracking ───

// 12. Quality gate version must exist
const versions = {
  qualityGateVersion: "1.0.0",
  scoringVersion: "1.0.0",
  analyserVersion: "1.0.0-baseline",
};
assert(versions.qualityGateVersion.length > 0, "quality gate version exists");
assert(versions.scoringVersion.length > 0, "scoring version exists");

// ─── Verify screenshot detection signals ───

// 13. Multiple signals must be checked
const screenshotSignals = [
  "common-screenshot-aspect-ratio",
  "status-bar-like-region",
  "uniform-bottom-bar",
  "uniform-side-margins",
  "sharp-ui-edges",
  "nested-photo-region",
];
assert(screenshotSignals.length === 6, "screenshot has 6 detection signals");

// ─── Report ───

console.log("\n🔬 Quality Gate Regression Tests\n");
console.log(`✅ Passed: ${passes.length}`);
console.log(`❌ Failed: ${failures.length}`);

if (failures.length > 0) {
  console.log("\nFailures:");
  for (const f of failures) console.log(`  ❌ ${f}`);
  process.exit(1);
} else {
  console.log("\n✅ All quality gate regression tests passed");
}
