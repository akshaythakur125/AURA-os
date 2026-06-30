import type { ImageMetrics, StatusLeak, Category } from "@/types";

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function computeAuraScore(metrics: ImageMetrics): number {
  const raw =
    metrics.lightingScore * 0.25 +
    metrics.clarityScore * 0.25 +
    metrics.compositionScore * 0.20 +
    (metrics.contrast * 0.5 + metrics.saturation * 0.5) * 0.15 +
    ((100 - metrics.backgroundComplexityEstimate) * 0.5 + (metrics.overallImageQualityScore) * 0.5) * 0.15;
  return clamp(Math.round(raw), 35, 92);
}

export function getCategory(score: number): Category {
  if (score <= 45) return "Low-Clarity Presentation";
  if (score <= 55) return "Clean but Basic";
  if (score <= 65) return "Urban Aspirational";
  if (score <= 75) return "Premium Potential";
  if (score <= 85) return "Strong Visual Signal";
  return "Overdone / Busy Signal";
}

export function getVerdict(score: number): string {
  if (score <= 45) return "Your visual signal needs improvement. Small changes can make a big difference.";
  if (score <= 55) return "You have a clean baseline. A few upgrades can take it further.";
  if (score <= 65) return "You are on the right track. Targeted upgrades will strengthen your signal.";
  if (score <= 75) return "Strong presentation with room to polish a few details.";
  if (score <= 85) return "Your visual signal is solid. Consistency and subtle refinement will set you apart.";
  return "Your presentation is visually busy. Simplifying key elements may strengthen the signal.";
}

export function getStrongestSignals(metrics: ImageMetrics): string[] {
  const signals: { name: string; value: number }[] = [
    { name: "Lighting", value: metrics.lightingScore },
    { name: "Clarity", value: metrics.clarityScore },
    { name: "Composition", value: metrics.compositionScore },
    { name: "Contrast Balance", value: metrics.contrast },
    { name: "Color Saturation", value: metrics.saturation },
    { name: "Sharpness", value: metrics.sharpness },
  ];
  return signals
    .sort((a, b) => b.value - a.value)
    .slice(0, 3)
    .map((s) => s.name);
}

export function generateStatusLeaks(metrics: ImageMetrics): StatusLeak[] {
  const leaks: StatusLeak[] = [];

  if (metrics.lightingScore < 55) {
    leaks.push({
      title: "Lighting is weakening the frame",
      explanation:
        "The image may not create a clean premium first impression because the lighting signal is weak.",
      fix: "Use window light, avoid harsh overhead light, and face the main light source.",
      severity: metrics.lightingScore < 40 ? "high" : "medium",
      impactScore: Math.round((55 - metrics.lightingScore) * 1.5),
    });
  }

  if (metrics.sharpness < 55) {
    leaks.push({
      title: "Clarity leak",
      explanation:
        "The frame may look less intentional because details are not crisp enough.",
      fix: "Use the rear camera, clean the lens, and avoid shaky low-light shots.",
      severity: metrics.sharpness < 40 ? "high" : "medium",
      impactScore: Math.round((55 - metrics.sharpness) * 1.5),
    });
  }

  if (metrics.backgroundComplexityEstimate > 70) {
    leaks.push({
      title: "Busy background",
      explanation:
        "The viewer\u2019s attention may split between the subject and the background.",
      fix: "Use a cleaner wall, less cluttered room, or more distance from background objects.",
      severity: metrics.backgroundComplexityEstimate > 80 ? "high" : "medium",
      impactScore: Math.round((metrics.backgroundComplexityEstimate - 70) * 1.2),
    });
  }

  if (metrics.compositionScore < 55) {
    leaks.push({
      title: "Weak framing",
      explanation:
        "The frame may not feel profile-ready because the crop or aspect ratio is not ideal.",
      fix: "Use a clean vertical frame with the subject centered and enough headroom.",
      severity: metrics.compositionScore < 40 ? "high" : "medium",
      impactScore: Math.round((55 - metrics.compositionScore) * 1.3),
    });
  }

  if (metrics.saturation < 30) {
    leaks.push({
      title: "Low color saturation",
      explanation:
        "The image may feel flat or dull, which can reduce visual engagement.",
      fix: "Ensure good lighting, avoid over-filtering, and shoot in well-lit natural settings.",
      severity: "low",
      impactScore: 20,
    });
  }

  if (metrics.contrast < 35) {
    leaks.push({
      title: "Low contrast signal",
      explanation:
        "The image may feel washed out and less dynamic, reducing overall visual impact.",
      fix: "Add directional lighting and avoid shooting in flat overcast environments.",
      severity: "low",
      impactScore: 18,
    });
  }

  return leaks;
}

export function generateQuickFixes(metrics: ImageMetrics): string[] {
  const fixes: string[] = [];
  if (metrics.lightingScore < 55) fixes.push("Improve lighting — face a window or use a ring light");
  if (metrics.sharpness < 55) fixes.push("Sharpen the image — stabilize the camera and clean the lens");
  if (metrics.backgroundComplexityEstimate > 70) fixes.push("Simplify the background — remove clutter or move to a plain wall");
  if (metrics.compositionScore < 55) fixes.push("Reframe the shot — center the subject and adjust the crop");
  if (fixes.length === 0) fixes.push("Your image metrics are solid. Focus on consistency across photos.");
  return fixes;
}
