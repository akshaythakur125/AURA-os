/**
 * Photo Quality Gate
 * Pre-analysis check that rejects bad photos before the full pipeline runs.
 * Better UX: users get instant feedback instead of a bad score from a bad photo.
 */

export type QualityIssue = "too_small" | "too_dark" | "too_bright" | "blurry" | "no_face" | "low_resolution" | "overexposed";

export interface QualityGateResult {
  passed: boolean;
  issues: QualityIssue[];
  qualityScore: number; // 0-100
  message: string;
  canProceed: boolean; // false = don't run analysis, true = analysis will be meaningful
}

function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

/**
 * Run quality gate on image data.
 * @param width - image width in pixels
 * @param height - image height in pixels
 * @param avgBrightness - mean brightness 0-255
 * @param brightnessStdDev - standard deviation of brightness (blur proxy)
 * @param faceDetected - whether face detection found a face
 * @param faceAreaPct - percentage of image area occupied by face (0-100)
 */
export function runQualityGate(params: {
  width: number;
  height: number;
  avgBrightness: number;
  brightnessStdDev: number;
  faceDetected: boolean;
  faceAreaPct: number;
}): QualityGateResult {
  const issues: QualityIssue[] = [];
  let qualityScore = 100;

  // Resolution check
  if (params.width < 300 || params.height < 300) {
    issues.push("too_small");
    qualityScore -= 30;
  } else if (params.width < 500 || params.height < 500) {
    issues.push("low_resolution");
    qualityScore -= 15;
  }

  // Brightness check
  if (params.avgBrightness < 40) {
    issues.push("too_dark");
    qualityScore -= 25;
  } else if (params.avgBrightness < 60) {
    issues.push("too_dark");
    qualityScore -= 10;
  } else if (params.avgBrightness > 220) {
    issues.push("overexposed");
    qualityScore -= 25;
  } else if (params.avgBrightness > 195) {
    issues.push("too_bright");
    qualityScore -= 10;
  }

  // Blur check (low std dev = flat = blurry)
  if (params.brightnessStdDev < 15) {
    issues.push("blurry");
    qualityScore -= 30;
  } else if (params.brightnessStdDev < 25) {
    qualityScore -= 10;
  }

  // Face check
  if (!params.faceDetected) {
    issues.push("no_face");
    qualityScore -= 40;
  } else if (params.faceAreaPct < 3) {
    issues.push("no_face");
    qualityScore -= 20;
  }

  qualityScore = clamp(qualityScore, 0, 100);

  // Determine if analysis can proceed
  const critical = issues.filter(i => ["too_small", "no_face", "blurry"].includes(i));
  const canProceed = critical.length === 0 && qualityScore >= 30;

  // Generate message
  let message: string;
  if (!canProceed) {
    if (issues.includes("no_face")) {
      message = "No face detected. Please upload a clear photo with your face visible.";
    } else if (issues.includes("too_small")) {
      message = "Image is too small. Please upload a photo at least 300x300 pixels.";
    } else if (issues.includes("blurry")) {
      message = "Photo appears blurry. Try holding your phone steady or using a timer.";
    } else {
      message = "Photo quality is too low for accurate analysis.";
    }
  } else if (qualityScore < 60) {
    message = "Photo quality is below average. Results may be less accurate. Consider retaking with better lighting.";
  } else if (qualityScore < 80) {
    message = "Photo is acceptable. Results will be reasonably accurate.";
  } else {
    message = "Great photo quality. Analysis will be highly accurate.";
  }

  return { passed: qualityScore >= 50, issues, qualityScore, message, canProceed };
}
