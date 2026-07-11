/**
 * Photo Quality Gate — strict input-validity and image-quality validation.
 * ponytail: single function, blocks bad images before scoring.
 */

export type QualityIssue =
  | "too_small"
  | "too_dark"
  | "too_bright"
  | "blurry"
  | "no_face"
  | "low_resolution"
  | "overexposed"
  | "screenshot_detected"
  | "multiple_faces"
  | "face_too_small"
  | "severe_blur";

export interface QualityGateResult {
  passed: boolean;
  issues: QualityIssue[];
  qualityScore: number; // 0-100
  message: string;
  canProceed: boolean; // false = don't run analysis
  screenshotLikelihood: number; // 0-1
  faceRegionSharpness: number; // 0-100
  effectiveFaceWidth: number; // pixels
  effectiveFaceHeight: number; // pixels
  faceAreaPercent: number;
}

function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

/**
 * Detect screenshot likelihood from image characteristics.
 * ponytail: pixel-level heuristic — no ML model needed.
 */
function detectScreenshot(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number
): { likelihood: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];

  // Signal 1: Common mobile screenshot aspect ratios (9:19.5, 9:20, 9:16)
  const ratio = w / h;
  const commonRatios = [9 / 19.5, 9 / 20, 9 / 16, 9 / 18, 3 / 4, 9 / 19];
  for (const r of commonRatios) {
    if (Math.abs(ratio - r) < 0.03) {
      score += 0.2;
      reasons.push("common-screenshot-aspect-ratio");
      break;
    }
  }

  // Signal 2: Status bar — top 5% has high-contrast horizontal strip
  const topStrip = ctx.getImageData(0, 0, w, Math.min(40, h * 0.05));
  let topContrast = 0;
  for (let i = 0; i < topStrip.data.length; i += 4) {
    topContrast += Math.abs(topStrip.data[i] - topStrip.data[i + 1]);
  }
  topContrast /= (topStrip.data.length / 4) || 1;
  if (topContrast > 30 && topContrast < 120) {
    score += 0.15;
    reasons.push("status-bar-like-region");
  }

  // Signal 3: Bottom navigation bar — bottom 8% has uniform region
  const bottomH = Math.min(Math.round(h * 0.08), 80);
  const bottomStrip = ctx.getImageData(0, h - bottomH, w, bottomH);
  const bottomBrightness = Array.from({ length: bottomStrip.data.length / 4 }, (_, i) => {
    const idx = i * 4;
    return (bottomStrip.data[idx] + bottomStrip.data[idx + 1] + bottomStrip.data[idx + 2]) / 3;
  });
  const bottomStd = Math.sqrt(
    bottomBrightness.reduce((s, v) => s + (v - bottomBrightness.reduce((a, b) => a + b, 0) / bottomBrightness.length) ** 2, 0) / bottomBrightness.length
  );
  if (bottomStd < 40 && bottomBrightness.length > 100) {
    score += 0.15;
    reasons.push("uniform-bottom-bar");
  }

  // Signal 4: Large uniform side margins (letterboxing)
  const leftCol = ctx.getImageData(0, Math.round(h * 0.3), Math.min(30, Math.round(w * 0.03)), Math.round(h * 0.4));
  const rightCol = ctx.getImageData(w - Math.min(30, Math.round(w * 0.03)), Math.round(h * 0.3), Math.min(30, Math.round(w * 0.03)), Math.round(h * 0.4));
  const leftAvg = Array.from({ length: leftCol.data.length / 4 }, (_, i) => leftCol.data[i * 4]);
  const rightAvg = Array.from({ length: rightCol.data.length / 4 }, (_, i) => rightCol.data[i * 4]);
  const leftStd = Math.sqrt(leftAvg.reduce((s, v) => s + (v - leftAvg.reduce((a, b) => a + b, 0) / leftAvg.length) ** 2, 0) / leftAvg.length);
  const rightStd = Math.sqrt(rightAvg.reduce((s, v) => s + (v - rightAvg.reduce((a, b) => a + b, 0) / rightAvg.length) ** 2, 0) / rightAvg.length);
  if (leftStd < 15 && rightStd < 15 && leftAvg.length > 50 && rightAvg.length > 50) {
    score += 0.15;
    reasons.push("uniform-side-margins");
  }

  // Signal 5: Sharp UI edges (high local contrast in top/bottom regions)
  const edgeData = ctx.getImageData(0, 0, w, Math.min(60, Math.round(h * 0.06)));
  let edgeCount = 0;
  for (let i = 0; i < edgeData.data.length - 4; i += 4) {
    const diff = Math.abs(edgeData.data[i] - edgeData.data[i + 4]);
    if (diff > 100) edgeCount++;
  }
  if (edgeCount > edgeData.data.length * 0.005) {
    score += 0.15;
    reasons.push("sharp-ui-edges");
  }

  // Signal 6: Nested photo — center region has different sharpness than edges
  const centerX = Math.round(w / 2);
  const centerY = Math.round(h / 2);
  const centerPatch = ctx.getImageData(centerX - 50, centerY - 50, 100, 100);
  let centerEdge = 0;
  for (let i = 0; i < centerPatch.data.length - 4; i += 4) {
    if (Math.abs(centerPatch.data[i] - centerPatch.data[i + 4]) > 50) centerEdge++;
  }
  if (centerEdge > 100 && edgeCount > edgeData.data.length * 0.003) {
    score += 0.1;
    reasons.push("nested-photo-region");
  }

  return { likelihood: clamp(score, 0, 1), reasons };
}

/**
 * Measure face-region sharpness separately from global sharpness.
 * ponytail: compare face region edge density vs global edge density.
 */
function measureFaceRegionSharpness(
  ctx: CanvasRenderingContext2D,
  faceX: number,
  faceY: number,
  faceW: number,
  faceH: number,
  imgW: number,
  imgH: number
): number {
  // Clamp face bounds to image
  const x = Math.max(0, Math.round(faceX));
  const y = Math.max(0, Math.round(faceY));
  const w = Math.min(imgW - x, Math.round(faceW));
  const h = Math.min(imgH - y, Math.round(faceH));
  if (w < 10 || h < 10) return 0;

  const faceData = ctx.getImageData(x, y, w, h);
  let edges = 0;
  for (let i = 0; i < faceData.data.length - 4; i += 4) {
    const diff = Math.abs(faceData.data[i] - faceData.data[i + 4]);
    if (diff > 30) edges++;
  }
  return clamp((edges / (faceData.data.length / 4)) * 200, 0, 100);
}

/**
 * Run quality gate on image data.
 * Enhanced: screenshot detection, face-region sharpness, face resolution.
 */
export function runQualityGate(params: {
  width: number;
  height: number;
  avgBrightness: number;
  brightnessStdDev: number;
  faceDetected: boolean;
  faceAreaPct: number;
  canvasContext?: CanvasRenderingContext2D;
  faceBox?: { x: number; y: number; width: number; height: number };
  faceCount?: number;
}): QualityGateResult {
  const issues: QualityIssue[] = [];
  let qualityScore = 100;
  let screenshotLikelihood = 0;
  let faceRegionSharpness = 0;
  let effectiveFaceWidth = 0;
  let effectiveFaceHeight = 0;

  // Screenshot detection
  if (params.canvasContext && params.width > 100 && params.height > 100) {
    const ss = detectScreenshot(params.canvasContext, params.width, params.height);
    screenshotLikelihood = ss.likelihood;
    if (ss.likelihood > 0.5) {
      issues.push("screenshot_detected");
      qualityScore -= 50;
    }
  }

  // Resolution check
  if (params.width < 300 || params.height < 300) {
    issues.push("too_small");
    qualityScore -= 30;
  } else if (params.width < 500 || params.height < 500) {
    issues.push("low_resolution");
    qualityScore -= 15;
  }

  // Brightness check
  if (params.avgBrightness < 30) {
    issues.push("too_dark");
    qualityScore -= 30;
  } else if (params.avgBrightness < 50) {
    issues.push("too_dark");
    qualityScore -= 15;
  } else if (params.avgBrightness > 230) {
    issues.push("overexposed");
    qualityScore -= 30;
  } else if (params.avgBrightness > 200) {
    issues.push("too_bright");
    qualityScore -= 10;
  }

  // Global blur check
  if (params.brightnessStdDev < 12) {
    issues.push("severe_blur");
    qualityScore -= 40;
  } else if (params.brightnessStdDev < 20) {
    issues.push("blurry");
    qualityScore -= 20;
  }

  // Face detection
  if (!params.faceDetected) {
    issues.push("no_face");
    qualityScore -= 40;
  } else if (params.faceAreaPct < 1) {
    issues.push("face_too_small");
    qualityScore -= 25;
  } else if (params.faceAreaPct < 3) {
    issues.push("face_too_small");
    qualityScore -= 15;
  }

  // Multiple faces
  if (params.faceCount && params.faceCount > 1) {
    issues.push("multiple_faces");
    qualityScore -= 30;
  }

  // Face-region sharpness (if face box available)
  if (params.canvasContext && params.faceBox) {
    faceRegionSharpness = measureFaceRegionSharpness(
      params.canvasContext,
      params.faceBox.x,
      params.faceBox.y,
      params.faceBox.width,
      params.faceBox.height,
      params.width,
      params.height
    );
    effectiveFaceWidth = Math.round(params.faceBox.width);
    effectiveFaceHeight = Math.round(params.faceBox.height);

    // If face region is blurry but global is sharp (screenshot with embedded photo)
    if (faceRegionSharpness < 25 && params.brightnessStdDev > 30) {
      issues.push("severe_blur");
      qualityScore -= 25;
    }
  }

  qualityScore = clamp(qualityScore, 0, 100);

  // Determine if analysis can proceed
  const critical = issues.filter((i) =>
    ["too_small", "no_face", "blurry", "severe_blur", "screenshot_detected", "multiple_faces", "face_too_small", "overexposed", "too_dark"].includes(i)
  );
  const canProceed = critical.length === 0 && qualityScore >= 30;

  // Generate message
  let message: string;
  if (!canProceed) {
    if (issues.includes("screenshot_detected")) {
      message = "This appears to be a screenshot or an image containing another image. Upload the original photograph for a reliable assessment.";
    } else if (issues.includes("severe_blur")) {
      message = "This photo is too blurry for reliable analysis. Try cleaning your lens, tapping to focus, and holding steady.";
    } else if (issues.includes("no_face")) {
      message = "No face detected. Please upload a clear photo with your face visible.";
    } else if (issues.includes("face_too_small")) {
      message = "The face is too small in the frame. Move closer or crop to a chest-up composition.";
    } else if (issues.includes("too_small")) {
      message = "Image is too small. Please upload a photo at least 300x300 pixels.";
    } else if (issues.includes("multiple_faces")) {
      message = "Multiple faces detected. Upload a photo with one primary subject.";
    } else if (issues.includes("too_dark")) {
      message = "Photo is too dark. Try facing a window or using softer front lighting.";
    } else if (issues.includes("overexposed")) {
      message = "Photo is overexposed. Try reducing direct sunlight or using shade.";
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

  return {
    passed: qualityScore >= 50,
    issues,
    qualityScore,
    message,
    canProceed,
    screenshotLikelihood,
    faceRegionSharpness,
    effectiveFaceWidth,
    effectiveFaceHeight,
    faceAreaPercent: params.faceAreaPct,
  };
}
