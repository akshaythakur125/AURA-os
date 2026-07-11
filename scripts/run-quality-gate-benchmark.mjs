#!/usr/bin/env node
/**
 * ponytail: full quality gate benchmark — real metrics, real artifacts.
 * Run: node scripts/run-quality-gate-benchmark.mjs
 */

import sharp from "sharp";
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from "fs";
import { join } from "path";

const GENERATED_DIR = "datasets/generated";
const OUTPUT_DIR = "artifacts/benchmarks";

async function getPixels(imgPath) {
  const { data, info } = await sharp(imgPath).raw().toBuffer({ resolveWithObject: true });
  return { data, width: info.width, height: info.height, channels: info.channels };
}

function computeMetrics(pixels) {
  const { data, width, height, channels } = pixels;
  const total = width * height;
  let sum = 0;
  const brightnesses = [];
  for (let i = 0; i < data.length; i += channels) {
    const b = (data[i] + data[i + 1] + data[i + 2]) / 3;
    sum += b;
    brightnesses.push(b);
  }
  const avg = sum / total;
  const variance = brightnesses.reduce((s, b) => s + (b - avg) ** 2, 0) / total;
  const stdDev = Math.sqrt(variance);

  let edges = 0;
  for (let y = 0; y < height - 1; y++) {
    for (let x = 0; x < width - 1; x++) {
      const idx = (y * width + x) * channels;
      const diffH = Math.abs(data[idx] - data[(y * width + x + 1) * channels]);
      const diffV = Math.abs(data[idx] - data[((y + 1) * width + x) * channels]);
      if (diffH > 20 || diffV > 20) edges++;
    }
  }

  return { avgBrightness: avg, stdDev, edgeDensity: edges / total, width, height };
}

function qualityGate(metrics) {
  const issues = [];
  let score = 100;

  if (metrics.width < 300 || metrics.height < 300) { issues.push("too_small"); score -= 30; }
  else if (metrics.width < 500 || metrics.height < 500) { issues.push("low_resolution"); score -= 15; }

  if (metrics.avgBrightness < 30) { issues.push("too_dark"); score -= 30; }
  else if (metrics.avgBrightness < 50) { issues.push("too_dark"); score -= 15; }
  else if (metrics.avgBrightness > 230) { issues.push("overexposed"); score -= 30; }
  else if (metrics.avgBrightness > 200) { issues.push("too_bright"); score -= 10; }

  if (metrics.stdDev < 12) { issues.push("severe_blur"); score -= 40; }
  else if (metrics.stdDev < 20) { issues.push("blurry"); score -= 20; }

  score = Math.max(0, Math.min(100, score));
  const critical = issues.filter(i => ["too_small", "severe_blur", "overexposed", "too_dark"].includes(i));
  return { qualityScore: score, issues, canProceed: critical.length === 0 && score >= 30 };
}

async function runBenchmark() {
  const manifestPath = join(GENERATED_DIR, "manifest.json");
  if (!existsSync(manifestPath)) { console.error("❌ No images. Run: npm run fixtures:generate-images"); process.exit(1); }

  const manifest = JSON.parse(readFileSync(manifestPath, "utf-8"));
  const images = manifest.images || [];
  console.log(`\n🔬 Quality Gate Benchmark — ${images.length} images\n`);

  mkdirSync(OUTPUT_DIR, { recursive: true });
  const results = [];
  const failures = [];
  const confusion = { tp: 0, tn: 0, fp: 0, fn: 0 }; // for blur detection: blur expected = positive

  for (const img of images) {
    if (!existsSync(img.path)) continue;
    const start = performance.now();
    try {
      const pixels = await getPixels(img.path);
      const metrics = computeMetrics(pixels);
      const gate = qualityGate(metrics);
      const duration = performance.now() - start;

      const isBlurry = img.name.includes("blur");
      const isRejected = !gate.canProceed;
      if (isBlurry && isRejected) confusion.tp++;
      else if (!isBlurry && !isRejected) confusion.tn++;
      else if (!isBlurry && isRejected) confusion.fp++;
      else confusion.fn++;

      results.push({ name: img.name, type: img.type || "synthetic", transform: img.transform || "base", metrics: { brightness: +metrics.avgBrightness.toFixed(1), stdDev: +metrics.stdDev.toFixed(1), edgeDensity: +metrics.edgeDensity.toFixed(4) }, qualityScore: gate.qualityScore, issues: gate.issues, canProceed: gate.canProceed, durationMs: +duration.toFixed(1) });
    } catch (e) {
      failures.push({ name: img.name, error: e.message });
    }
  }

  // Metrics
  const total = results.length;
  const passed = results.filter(r => r.canProceed).length;
  const rejected = results.filter(r => !r.canProceed).length;
  const durations = results.map(r => r.durationMs).sort((a, b) => a - b);
  const p50 = durations[Math.floor(durations.length * 0.5)] || 0;
  const p95 = durations[Math.floor(durations.length * 0.95)] || 0;

  // Blur detection metrics
  const blurPrecision = confusion.tp + confusion.fp > 0 ? confusion.tp / (confusion.tp + confusion.fp) : 0;
  const blurRecall = confusion.tp + confusion.fn > 0 ? confusion.tp / (confusion.tp + confusion.fn) : 0;
  const blurF1 = blurPrecision + blurRecall > 0 ? 2 * blurPrecision * blurRecall / (blurPrecision + blurRecall) : 0;

  // Dark/bright detection
  const darkExpected = results.filter(r => r.name.includes("dark") || r.name.includes("blank"));
  const darkRejected = darkExpected.filter(r => !r.canProceed).length;
  const darkRate = darkExpected.length > 0 ? darkRejected / darkExpected.length : 0;

  // Tiny detection
  const tinyExpected = results.filter(r => r.name.includes("tiny"));
  const tinyRejected = tinyExpected.filter(r => !r.canProceed).length;
  const tinyRate = tinyExpected.length > 0 ? tinyRejected / tinyExpected.length : 0;

  // Valid portrait acceptance (normal, warm, cool, desaturated, noise)
  const validExpected = results.filter(r => r.name.includes("normal") || r.name.includes("warm") || r.name.includes("cool") || r.name.includes("desaturated") || r.name.includes("noise"));
  const validPassed = validExpected.filter(r => r.canProceed).length;
  const validRate = validExpected.length > 0 ? validPassed / validExpected.length : 0;

  console.log(`📊 Results: ${total} images, ${passed} passed, ${rejected} rejected`);
  console.log(`   Blur detection: P=${(blurPrecision*100).toFixed(1)}% R=${(blurRecall*100).toFixed(1)}% F1=${(blurF1*100).toFixed(1)}%`);
  console.log(`   Dark/blank rejection: ${(darkRate*100).toFixed(1)}%`);
  console.log(`   Tiny rejection: ${(tinyRate*100).toFixed(1)}%`);
  console.log(`   Valid portrait acceptance: ${(validRate*100).toFixed(1)}%`);
  console.log(`   Latency: P50=${p50.toFixed(1)}ms P95=${p95.toFixed(1)}ms`);
  console.log(`   Failures: ${failures.length}`);

  // Write artifacts
  const report = { timestamp: new Date().toISOString(), totalImages: total, passed, rejected, failures: failures.length, latency: { p50, p95, max: durations[durations.length - 1] || 0 }, metrics: { blurDetection: { precision: blurPrecision, recall: blurRecall, f1: blurF1, tp: confusion.tp, tn: confusion.tn, fp: confusion.fp, fn: confusion.fn, sampleSize: total }, darkRejection: { rate: darkRate, sampleSize: darkExpected.length }, tinyRejection: { rate: tinyRate, sampleSize: tinyExpected.length }, validPortraitAcceptance: { rate: validRate, sampleSize: validExpected.length } }, results };
  writeFileSync(join(OUTPUT_DIR, "quality-gate-benchmark.json"), JSON.stringify(report, null, 2));

  const md = [`# Quality Gate Benchmark`, ``, `**Date:** ${report.timestamp}`, `**Images:** ${total} (${passed} passed, ${rejected} rejected)`, ``, `## Metrics`, ``, `| Metric | Value | Samples |`, `|--------|-------|---------|`, `| Blur Precision | ${(blurPrecision*100).toFixed(1)}% | ${total} |`, `| Blur Recall | ${(blurRecall*100).toFixed(1)}% | ${total} |`, `| Blur F1 | ${(blurF1*100).toFixed(1)}% | ${total} |`, `| Dark Rejection | ${(darkRate*100).toFixed(1)}% | ${darkExpected.length} |`, `| Tiny Rejection | ${(tinyRate*100).toFixed(1)}% | ${tinyExpected.length} |`, `| Valid Acceptance | ${(validRate*100).toFixed(1)}% | ${validExpected.length} |`, `| P50 Latency | ${p50.toFixed(1)}ms | ${total} |`, `| P95 Latency | ${p95.toFixed(1)}ms | ${total} |`, ``, `## Confusion Matrix (Blur Detection)`, ``, `| | Predicted Blur | Predicted OK |`, `|---|---|---|`, `| Actually Blur | ${confusion.tp} | ${confusion.fn} |`, `| Actually OK | ${confusion.fp} | ${confusion.tn} |`];
  writeFileSync(join(OUTPUT_DIR, "quality-gate-benchmark.md"), md.join("\n"));
  console.log(`\n✅ Artifacts: ${OUTPUT_DIR}/quality-gate-benchmark.json + .md`);
}

runBenchmark().catch(e => { console.error("❌", e.message); process.exit(1); });
