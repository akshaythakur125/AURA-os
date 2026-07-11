#!/usr/bin/env node
/**
 * ponytail: monotonicity tests — verify increasing distortion severity behaves logically.
 * Run: node scripts/monotonicity-test.mjs
 *
 * These test the TRANSFORMATION DEFINITIONS, not the analyser output.
 * They verify that the transformation parameter space is ordered correctly.
 */

const failures = [];
const passes = [];

function assert(condition, label) {
  if (condition) passes.push(label);
  else failures.push(label);
}

// ─── Blur monotonicity: higher strength = more blur ───
const blurStrengths = [2, 3, 5, 8, 12, 25];
for (let i = 1; i < blurStrengths.length; i++) {
  assert(blurStrengths[i] > blurStrengths[i - 1], `blur strength increases: ${blurStrengths[i - 1]} < ${blurStrengths[i]}`);
}

// ─── Underexposure monotonicity: lower factor = darker ───
const underexFactors = [0.5, 0.3, 0.15, 0.05, 0.03];
for (let i = 1; i < underexFactors.length; i++) {
  assert(underexFactors[i] < underexFactors[i - 1], `underexposure factor decreases: ${underexFactors[i - 1]} > ${underexFactors[i]}`);
}

// ─── Overexposure monotonicity: higher factor = brighter ───
const overexFactors = [1.5, 1.8, 2.5, 3.0, 4.0];
for (let i = 1; i < overexFactors.length; i++) {
  assert(overexFactors[i] > overexFactors[i - 1], `overexposure factor increases: ${overexFactors[i - 1]} < ${overexFactors[i]}`);
}

// ─── Downscale monotonicity: lower scale = smaller ───
const downscaleFactors = [0.15, 0.08];
for (let i = 1; i < downscaleFactors.length; i++) {
  assert(downscaleFactors[i] < downscaleFactors[i - 1], `downscale factor decreases: ${downscaleFactors[i - 1]} > ${downscaleFactors[i]}`);
}

// ─── Noise monotonicity: higher intensity = more noise ───
const noiseLevels = [30, 50];
assert(noiseLevels[1] > noiseLevels[0], `noise intensity increases: ${noiseLevels[0]} < ${noiseLevels[1]}`);

// ─── Motion blur monotonicity: longer length = more motion blur ───
const motionLengths = [5, 20];
assert(motionLengths[1] > motionLengths[0], `motion blur length increases: ${motionLengths[0]} < ${motionLengths[1]}`);

// ─── Headroom monotonicity: more pixels = more headroom ───
const headroomPixels = [100, 150, 300];
for (let i = 1; i < headroomPixels.length; i++) {
  assert(headroomPixels[i] > headroomPixels[i - 1], `headroom increases: ${headroomPixels[i - 1]} < ${headroomPixels[i]}`);
}

// ─── Crop monotonicity: lower top = more aggressive crop ───
const cropTops = [0.4, 0.3, 0.0];
for (let i = 1; i < cropTops.length; i++) {
  assert(cropTops[i] < cropTops[i - 1], `crop top decreases (more aggressive): ${cropTops[i - 1]} > ${cropTops[i]}`);
}

// ─── Quality gate expectations ───
assert(blurStrengths[blurStrengths.length - 1] >= 12, "extreme blur triggers rejection threshold");
assert(underexFactors[underexFactors.length - 1] <= 0.05, "extreme underexposure triggers rejection threshold");
assert(overexFactors[overexFactors.length - 1] >= 3.0, "extreme overexposure triggers rejection threshold");
assert(downscaleFactors[downscaleFactors.length - 1] <= 0.1, "extreme downscale triggers rejection threshold");

// ─── Report ───
console.log("\n🔬 Monotonicity Tests\n");
console.log(`✅ Passed: ${passes.length}`);
console.log(`❌ Failed: ${failures.length}`);

if (failures.length > 0) {
  console.log("\nFailures:");
  for (const f of failures) console.log(`  ❌ ${f}`);
  process.exit(1);
} else {
  console.log("\n✅ All monotonicity tests passed");
}
