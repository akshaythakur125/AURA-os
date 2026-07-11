#!/usr/bin/env node
/**
 * ponytail: run quality gate on synthetic images using sharp (Node.js).
 * Collects real metrics. No browser needed.
 * Run: node scripts/run-quality-gate-benchmark.mjs
 */

import sharp from "sharp";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";

const GENERATED_DIR = "datasets/generated";
const OUTPUT_DIR = "artifacts/benchmarks";

async function getPixels(imgPath) {
  const { data, info } = await sharp(imgPath).raw().toBuffer({ resolveWithObject: true });
  return { data, width: info.width, height: info.height, channels: info.channels };
}

function computeMetrics(pixels) {
  const { data, width, height, channels } = pixels;
  const totalPixels = width * height;

  // Brightness
  let sumBrightness = 0;
  const brightnesses = [];
  for (let i = 0; i < data.length; i += channels) {
    const b = (data[i] + data[i + 1] + data[i + 2]) / 3;
    sumBrightness += b;
    brightnesses.push(b);
  }
  const avgBrightness = sumBrightness / totalPixels;

  // Std dev (blur proxy)
  const variance = brightnesses.reduce((s, b) => s + (b - avgBrightness) ** 2, 0) / totalPixels;
  const stdDev = Math.sqrt(variance);

  // Edge density (sharpness proxy)
  let edgeCount = 0;
  for (let y = 0; y < height - 1; y++) {
    for (let x = 0; x < width - 1; x++) {
      const idx = (y * width + x) * channels;
      const right = (y * width + x + 1) * channels;
      const down = ((y + 1) * width + x) * channels;
      const diffH = Math.abs(data[idx] - data[right]);
      const diffV = Math.abs(data[idx] - data[down]);
      if (diffH > 20 || diffV > 20) edgeCount++;
    }
  }
  const edgeDensity = edgeCount / totalPixels;

  return { avgBrightness, stdDev, edgeDensity, width, height, totalPixels };
}

function qualityGate(metrics) {
  const issues = [];
  let qualityScore = 100;

  if (metrics.width < 300 || metrics.height < 300) { issues.push("too_small"); qualityScore -= 30; }
  else if (metrics.width < 500 || metrics.height < 500) { issues.push("low_resolution"); qualityScore -= 15; }

  if (metrics.avgBrightness < 30) { issues.push("too_dark"); qualityScore -= 30; }
  else if (metrics.avgBrightness < 50) { issues.push("too_dark"); qualityScore -= 15; }
  else if (metrics.avgBrightness > 230) { issues.push("overexposed"); qualityScore -= 30; }
  else if (metrics.avgBrightness > 200) { issues.push("too_bright"); qualityScore -= 10; }

  if (metrics.stdDev < 12) { issues.push("severe_blur"); qualityScore -= 40; }
  else if (metrics.stdDev < 20) { issues.push("blurry"); qualityScore -= 20; }

  // No face detection in Node.js — skip face-related checks
  // In browser, face detection would add: no_face, face_too_small, multiple_faces

  qualityScore = Math.max(0, Math.min(100, qualityScore));
  const critical = issues.filter(i => ["too_small", "severe_blur", "overexposed", "too_dark"].includes(i));
  const canProceed = critical.length === 0 && qualityScore >= 30;

  return { qualityScore, issues, canProceed };
}

async function runBenchmark() {
  const manifestPath = join(GENERATED_DIR, "manifest.json");
  if (!existsSync(manifestPath)) {
    console.error("❌ No synthetic images found. Run: npm run fixtures:generate-images");
    process.exit(1);
  }

  const manifest = JSON.parse(readFileSync(manifestPath, "utf-8"));
  console.log(`\n🔬 Quality Gate Benchmark — ${manifest.count} images\n`);

  const results = [];

  for (const img of manifest.images) {
    const start = performance.now();
    const pixels = await getPixels(img.path);
    const metrics = computeMetrics(pixels);
    const gate = qualityGate(metrics);
    const duration = performance.now() - start;

    results.push({
      name: img.name,
      desc: img.desc,
      metrics: { avgBrightness: metrics.avgBrightness.toFixed(1), stdDev: metrics.stdDev.toFixed(1), edgeDensity: metrics.edgeDensity.toFixed(4) },
      qualityScore: gate.qualityScore,
      issues: gate.issues,
      canProceed: gate.canProceed,
      durationMs: duration.toFixed(1),
    });

    const status = gate.canProceed ? "✅" : "❌";
    console.log(`  ${status} ${img.name}: score=${gate.qualityScore} issues=[${gate.issues.join(",") || "none"}] ${duration.toFixed(0)}ms`);
  }

  // Summary
  const passed = results.filter(r => r.canProceed).length;
  const rejected = results.filter(r => !r.canProceed).length;
  const avgDuration = results.reduce((s, r) => s + Number(r.durationMs), 0) / results.length;

  console.log(`\n📊 Summary`);
  console.log(`  Total: ${results.length}`);
  console.log(`  Passed: ${passed}`);
  console.log(`  Rejected: ${rejected}`);
  console.log(`  Avg duration: ${avgDuration.toFixed(1)}ms`);

  // Write report
  mkdirSync(OUTPUT_DIR, { recursive: true });
  const report = {
    timestamp: new Date().toISOString(),
    totalImages: results.length,
    passed,
    rejected,
    avgDurationMs: avgDuration,
    results,
  };
  writeFileSync(join(OUTPUT_DIR, "quality-gate-benchmark.json"), JSON.stringify(report, null, 2));
  console.log(`\n✅ Report: ${OUTPUT_DIR}/quality-gate-benchmark.json`);
}

runBenchmark().catch(e => { console.error("❌", e.message); process.exit(1); });
