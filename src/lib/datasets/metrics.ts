/**
 * ponytail: benchmark metrics — accuracy, precision, recall, F1, MAE, correlation.
 */

export type MetricResult = {
  name: string;
  value: number;
  sampleSize: number;
  note?: string;
};

/** Binary classification metrics */
export function binaryMetrics(
  predictions: boolean[],
  labels: boolean[]
): MetricResult[] {
  const n = Math.min(predictions.length, labels.length);
  if (n === 0) return [{ name: "accuracy", value: 0, sampleSize: 0, note: "No samples" }];

  let tp = 0, tn = 0, fp = 0, fn = 0;
  for (let i = 0; i < n; i++) {
    if (predictions[i] && labels[i]) tp++;
    else if (!predictions[i] && !labels[i]) tn++;
    else if (predictions[i] && !labels[i]) fp++;
    else fn++;
  }

  const accuracy = (tp + tn) / n;
  const precision = tp + fp > 0 ? tp / (tp + fp) : 0;
  const recall = tp + fn > 0 ? tp / (tp + fn) : 0;
  const f1 = precision + recall > 0 ? 2 * (precision * recall) / (precision + recall) : 0;

  return [
    { name: "accuracy", value: accuracy, sampleSize: n },
    { name: "precision", value: precision, sampleSize: n },
    { name: "recall", value: recall, sampleSize: n },
    { name: "f1", value: f1, sampleSize: n },
    { name: "true_positives", value: tp, sampleSize: n },
    { name: "true_negatives", value: tn, sampleSize: n },
    { name: "false_positives", value: fp, sampleSize: n },
    { name: "false_negatives", value: fn, sampleSize: n },
  ];
}

/** Mean absolute error for regression */
export function mae(predictions: number[], labels: number[]): MetricResult {
  const n = Math.min(predictions.length, labels.length);
  if (n === 0) return { name: "mae", value: 0, sampleSize: 0 };
  let sum = 0;
  for (let i = 0; i < n; i++) sum += Math.abs(predictions[i] - labels[i]);
  return { name: "mae", value: sum / n, sampleSize: n };
}

/** Pearson correlation coefficient */
export function pearsonR(x: number[], y: number[]): MetricResult {
  const n = Math.min(x.length, y.length);
  if (n < 2) return { name: "pearson_r", value: 0, sampleSize: n, note: "Need at least 2 samples" };

  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;
  for (let i = 0; i < n; i++) {
    sumX += x[i]; sumY += y[i];
    sumXY += x[i] * y[i];
    sumX2 += x[i] * x[i]; sumY2 += y[i] * y[i];
  }

  const num = n * sumXY - sumX * sumY;
  const den = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
  return { name: "pearson_r", value: den === 0 ? 0 : num / den, sampleSize: n };
}

/** Latency metrics */
export function latencyMetrics(timesMs: number[]): MetricResult[] {
  if (timesMs.length === 0) return [{ name: "p50_latency_ms", value: 0, sampleSize: 0 }];
  const sorted = [...timesMs].sort((a, b) => a - b);
  const p = (q: number) => sorted[Math.floor(sorted.length * q)] || 0;
  return [
    { name: "mean_latency_ms", value: timesMs.reduce((a, b) => a + b, 0) / timesMs.length, sampleSize: timesMs.length },
    { name: "p50_latency_ms", value: p(0.5), sampleSize: timesMs.length },
    { name: "p95_latency_ms", value: p(0.95), sampleSize: timesMs.length },
    { name: "max_latency_ms", value: sorted[sorted.length - 1], sampleSize: timesMs.length },
  ];
}

/** Format metrics as Markdown table */
export function formatMetricsMarkdown(metrics: MetricResult[]): string {
  const lines = ["| Metric | Value | Samples |", "|--------|-------|---------|"];
  for (const m of metrics) {
    const val = m.value < 1 && m.value > -1 && m.name !== "sampleSize" && !m.name.includes("count")
      ? (m.value * 100).toFixed(1) + "%"
      : typeof m.value === "number" ? m.value.toFixed(3) : String(m.value);
    lines.push(`| ${m.name} | ${val} | ${m.sampleSize}${m.note ? ` (${m.note})` : ""} |`);
  }
  return lines.join("\n");
}
