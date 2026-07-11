import { readFileSync } from "fs";
const r = JSON.parse(readFileSync("artifacts/benchmarks/quality-gate-benchmark.json", "utf-8"));
const failures = [];
if (r.accuracy < 0.5) failures.push("accuracy=" + (r.accuracy * 100).toFixed(1) + "% < 50%");
if (r.downstream.rejectedWithOverallScore > 0) failures.push("rejectedWithScore=" + r.downstream.rejectedWithOverallScore);
if (r.downstream.rejectedWithPaidReport > 0) failures.push("rejectedWithPaid=" + r.downstream.rejectedWithPaidReport);
if (r.downstream.rejectedWithProductRecommendations > 0) failures.push("rejectedWithProducts=" + r.downstream.rejectedWithProductRecommendations);
if (failures.length > 0) { console.error("❌ GATE FAILURES:"); failures.forEach(f => console.error("  " + f)); process.exit(1); }
console.log("✅ Gate passed");
