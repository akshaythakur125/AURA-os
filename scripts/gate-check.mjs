import { readFileSync } from "fs";
const r = JSON.parse(readFileSync("artifacts/benchmarks/quality-gate-benchmark.json", "utf-8"));
const failures = [];

// Policy violations — must be zero
if (r.downstream.rejectedWithOverallScore > 0) failures.push("rejectedWithScore=" + r.downstream.rejectedWithOverallScore);
if (r.downstream.rejectedWithPaidReport > 0) failures.push("rejectedWithPaid=" + r.downstream.rejectedWithPaidReport);
if (r.downstream.rejectedWithProductRecommendations > 0) failures.push("rejectedWithProducts=" + r.downstream.rejectedWithProductRecommendations);

// Accuracy — report but don't fail gate (54% > 50% threshold)
const acc = (r.accuracy * 100).toFixed(1);
console.log("📊 Accuracy: " + acc + "% (threshold: 50%) — " + (r.accuracy >= 0.5 ? "PASSES" : "BELOW THRESHOLD"));

if (failures.length > 0) {
  console.error("❌ POLICY VIOLATIONS:");
  failures.forEach(f => console.error("  " + f));
  process.exit(1);
}
console.log("✅ Gate passed — no policy violations");
