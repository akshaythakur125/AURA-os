import type { ImageSignalMetrics } from "@/types/audit";

const ANALYSIS_WIDTH = 256;

function clamp(value: number, min = 0, max = 100): number {
  return Math.round(Math.min(max, Math.max(min, value)));
}

interface PixelStats {
  brightnessValues: number[];
  r: number[];
  g: number[];
  b: number[];
}

function extractPixelStats(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): PixelStats {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  const len = data.length;
  const brightnessValues: number[] = [];
  const r: number[] = [];
  const g: number[] = [];
  const b: number[] = [];

  for (let i = 0; i < len; i += 16) {
    const rr = data[i];
    const gg = data[i + 1];
    const bb = data[i + 2];
    r.push(rr);
    g.push(gg);
    b.push(bb);
    brightnessValues.push(0.2126 * rr + 0.7152 * gg + 0.0722 * bb);
  }

  return { brightnessValues, r, g, b };
}

function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((s, v) => s + v, 0) / values.length;
}

function stdDev(values: number[], m: number): number {
  if (values.length === 0) return 0;
  const variance =
    values.reduce((s, v) => s + (v - m) * (v - m), 0) / values.length;
  return Math.sqrt(variance);
}

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

// ─── New: Face zone detection via skin-tone heuristic ───

function isSkinTone(r: number, g: number, b: number): boolean {
  // HSV-based skin detection in RGB space
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);

  if (max - min < 0.05) return false; // too grey
  if (max < 0.15 || max > 0.95) return false; // too dark or too bright

  // Skin tone ranges (empirically tuned for diverse skin tones)
  return r > 60 && g > 40 && b > 20 &&
    r > g && r > b &&
    Math.abs(r - g) > 15 &&
    r - b > 15;
}

function detectFaceZone(
  data: Uint8ClampedArray,
  width: number,
  height: number
): { centerX: number; centerY: number; density: number; skinBrightness: number } {
  // Sample skin-tone pixels and find their centroid
  let skinCount = 0;
  let sumX = 0;
  let sumY = 0;
  let skinBrightnessSum = 0;

  for (let y = 0; y < height; y += 2) {
    for (let x = 0; x < width; x += 2) {
      const i = (y * width + x) * 4;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      if (isSkinTone(r, g, b)) {
        skinCount++;
        sumX += x;
        sumY += y;
        skinBrightnessSum += 0.2126 * r + 0.7152 * g + 0.0722 * b;
      }
    }
  }

  const totalPixels = (width / 2) * (height / 2);
  const density = skinCount / totalPixels;

  if (skinCount === 0) {
    return { centerX: width / 2, centerY: height / 2, density: 0, skinBrightness: 128 };
  }

  return {
    centerX: sumX / skinCount,
    centerY: sumY / skinCount,
    density,
    skinBrightness: skinBrightnessSum / skinCount,
  };
}

// ─── New: Lighting direction analysis ───

function analyzeLightingDirection(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): { direction: "left" | "right" | "top" | "bottom" | "flat" | "mixed"; score: number } {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  // Split into quadrants and measure brightness
  const halfW = Math.floor(width / 2);
  const halfH = Math.floor(height / 2);
  const zones = { tl: 0, tr: 0, bl: 0, br: 0, count: 0 };

  for (let y = 0; y < height; y += 3) {
    for (let x = 0; x < width; x += 3) {
      const i = (y * width + x) * 4;
      const lum = 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
      if (x < halfW && y < halfH) zones.tl += lum;
      else if (x >= halfW && y < halfH) zones.tr += lum;
      else if (x < halfW && y >= halfH) zones.bl += lum;
      else zones.br += lum;
      zones.count++;
    }
  }

  const qCount = zones.count / 4;
  const avg = { tl: zones.tl / qCount, tr: zones.tr / qCount, bl: zones.bl / qCount, br: zones.br / qCount };

  const leftRight = (avg.tl + avg.bl) - (avg.tr + avg.br);
  const topBottom = (avg.tl + avg.tr) - (avg.bl + avg.br);
  const diff = Math.max(Math.abs(leftRight), Math.abs(topBottom));

  if (diff < 8) return { direction: "flat", score: 30 };
  if (Math.abs(leftRight) > Math.abs(topBottom)) {
    if (leftRight > 0) return { direction: "left", score: 70 };
    return { direction: "right", score: 70 };
  }
  if (topBottom > 0) return { direction: "top", score: 50 }; // top-lit = overhead, less ideal
  return { direction: "bottom", score: 60 };
}

// ─── New: Color harmony analysis ───

function analyzeColorHarmony(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): { dominantHue: string; warmth: number; harmonyScore: number; dullness: number } {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  let warmCount = 0;
  let coolCount = 0;
  let totalSat = 0;
  let satCount = 0;
  let totalR = 0, totalG = 0, totalB = 0;
  let count = 0;

  for (let i = 0; i < data.length; i += 16) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    totalR += r;
    totalG += g;
    totalB += b;
    count++;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const sat = max === 0 ? 0 : (max - min) / max;
    totalSat += sat;
    satCount++;

    if (r > b + 20) warmCount++;
    else if (b > r + 20) coolCount++;
  }

  const avgR = totalR / count;
  const avgG = totalG / count;
  const avgB = totalB / count;
  const avgSat = satCount > 0 ? totalSat / satCount : 0;
  const warmth = (warmCount - coolCount) / count;

  let dominantHue = "neutral";
  if (avgR > avgG + 15 && avgR > avgB + 15) dominantHue = "warm";
  else if (avgB > avgR + 15 && avgB > avgG + 15) dominantHue = "cool";
  else if (avgG > avgR + 10 && avgG > avgB + 10) dominantHue = "greenish";

  // Harmony = how close saturation is to "natural" (0.3-0.5 range) + hue consistency
  const satScore = 100 - Math.abs(avgSat * 100 - 40) * 2;
  const hueConsistency = 100 - Math.abs(warmth) * 50;
  const harmonyScore = clamp(satScore * 0.6 + hueConsistency * 0.4);
  const dullness = clamp((1 - avgSat) * 100);

  return { dominantHue, warmth: clamp(warmth * 50 + 50), harmonyScore, dullness };
}

// ─── New: Symmetry analysis ───

function analyzeSymmetry(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): { symmetryScore: number; centerX: number } {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  const midX = Math.floor(width / 2);
  let totalDiff = 0;
  let count = 0;

  // Compare left half vs mirrored right half
  for (let y = 0; y < height; y += 3) {
    for (let x = 0; x < midX; x += 3) {
      const mirrorX = width - 1 - x;
      const i1 = (y * width + x) * 4;
      const i2 = (y * width + mirrorX) * 4;
      const lum1 = 0.2126 * data[i1] + 0.7152 * data[i1 + 1] + 0.0722 * data[i1 + 2];
      const lum2 = 0.2126 * data[i2] + 0.7152 * data[i2 + 1] + 0.0722 * data[i2 + 2];
      totalDiff += Math.abs(lum1 - lum2);
      count++;
    }
  }

  if (count === 0) return { symmetryScore: 50, centerX: midX };
  const avgDiff = totalDiff / count;
  const symmetryScore = clamp(100 - (avgDiff / 128) * 100);

  return { symmetryScore, centerX: midX };
}

// ─── New: Per-zone brightness (face vs background) ───

function analyzeZoneBrightness(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  faceCenter: { x: number; y: number }
): { faceBrightness: number; bgBrightness: number; contrastRatio: number } {
  const thirdH = height / 3;
  const thirdW = width / 3;

  // Face zone = center third
  let faceSum = 0, faceCount = 0;
  let bgSum = 0, bgCount = 0;

  for (let y = 0; y < height; y += 2) {
    for (let x = 0; x < width; x += 2) {
      const i = (y * width + x) * 4;
      const lum = 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];

      const inCenterX = x >= thirdW && x <= thirdW * 2;
      const inCenterY = y >= thirdH && y <= thirdH * 2;

      if (inCenterX && inCenterY) {
        faceSum += lum;
        faceCount++;
      } else {
        bgSum += lum;
        bgCount++;
      }
    }
  }

  const faceBrightness = faceCount > 0 ? faceSum / faceCount : 128;
  const bgBrightness = bgCount > 0 ? bgSum / bgCount : 128;
  const contrastRatio = faceBrightness > 0 ? Math.abs(faceBrightness - bgBrightness) : 0;

  return {
    faceBrightness: clamp((faceBrightness / 255) * 100),
    bgBrightness: clamp((bgBrightness / 255) * 100),
    contrastRatio: clamp(contrastRatio / 2.55),
  };
}

// ─── Existing functions (preserved) ───

function estimateSharpness(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): number {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  let totalDiff = 0;
  let count = 0;

  for (let y = 0; y < height - 1; y++) {
    for (let x = 0; x < width - 1; x++) {
      const i = (y * width + x) * 4;
      const ri = data[i];
      const gi = data[i + 1];
      const bi = data[i + 2];
      const lumI = 0.2126 * ri + 0.7152 * gi + 0.0722 * bi;

      const j = (y * width + (x + 1)) * 4;
      const rj = data[j];
      const gj = data[j + 1];
      const bj = data[j + 2];
      const lumJ = 0.2126 * rj + 0.7152 * gj + 0.0722 * bj;

      totalDiff += Math.abs(lumI - lumJ);
      count++;
    }
  }

  if (count === 0) return 0;
  const avgDiff = totalDiff / count;
  return clamp((avgDiff / 255) * 100);
}

function estimateEdgeDensity(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): number {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  let edges = 0;
  let count = 0;

  const threshold = 30;

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const i = (y * width + x) * 4;
      const lum =
        0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];

      const ix = (y * width + (x + 1)) * 4;
      const lumX =
        0.2126 * data[ix] + 0.7152 * data[ix + 1] + 0.0722 * data[ix + 2];

      const iy = ((y + 1) * width + x) * 4;
      const lumY =
        0.2126 * data[iy] + 0.7152 * data[iy + 1] + 0.0722 * data[iy + 2];

      const gx = Math.abs(lum - lumX);
      const gy = Math.abs(lum - lumY);
      const magnitude = Math.sqrt(gx * gx + gy * gy);

      if (magnitude > threshold) edges++;
      count++;
    }
  }

  if (count === 0) return 0;
  return clamp((edges / count) * 100);
}

function averageSaturation(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): number {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  const len = data.length;
  let totalSat = 0;
  let count = 0;

  for (let i = 0; i < len; i += 16) {
    const r = data[i] / 255;
    const g = data[i + 1] / 255;
    const b = data[i + 2] / 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const diff = max - min;
    const sat = max === 0 ? 0 : diff / max;
    totalSat += sat;
    count++;
  }

  if (count === 0) return 50;
  return clamp((totalSat / count) * 100);
}

// ─── Main export ───

export function analyzeImageDataUrl(
  dataUrl: string
): Promise<ImageSignalMetrics> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const scale = Math.min(ANALYSIS_WIDTH / img.width, 1);
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        canvas.width = w;
        canvas.height = h;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(fallbackMetrics(img.width, img.height));
          return;
        }

        ctx.drawImage(img, 0, 0, w, h);
        const stats = extractPixelStats(ctx, w, h);
        const imageData = ctx.getImageData(0, 0, w, h);

        // ─── Core metrics ───
        const avgBrightness = mean(stats.brightnessValues);
        const contrastVal = stdDev(stats.brightnessValues, avgBrightness);
        const sharpnessVal = estimateSharpness(ctx, w, h);
        const edgeDensity = estimateEdgeDensity(ctx, w, h);
        const sat = averageSaturation(ctx, w, h);

        const aspectRatio = img.width / img.height;
        const brightness = clamp((avgBrightness / 255) * 100);
        const contrast = clamp((contrastVal / 80) * 100);
        const saturation = clamp(sat);
        const sharpness = sharpnessVal;
        const edgeDensityScore = edgeDensity;

        const resolutionScore = clamp(
          ((Math.min(img.width, 1200) / 1200) * 50 +
            (Math.min(img.height, 1200) / 1200) * 50) *
            100
        );

        // ─── New: Face zone detection ───
        const faceZone = detectFaceZone(imageData.data, w, h);

        // ─── New: Lighting direction ───
        const lightingAnalysis = analyzeLightingDirection(ctx, w, h);

        // ─── New: Color harmony ───
        const colorAnalysis = analyzeColorHarmony(ctx, w, h);

        // ─── New: Symmetry ───
        const symmetryAnalysis = analyzeSymmetry(ctx, w, h);

        // ─── New: Zone brightness ───
        const zoneAnalysis = analyzeZoneBrightness(imageData.data, w, h, { x: faceZone.centerX, y: faceZone.centerY });

        // ─── Scored metrics (improved) ───
        // Lighting: now considers face brightness + direction + contrast
        const lightingScore = clamp(
          brightness * 0.25 +
          zoneAnalysis.faceBrightness * 0.25 +
          (100 - Math.abs(zoneAnalysis.faceBrightness - 60) * 1.5) * 0.2 +
          lightingAnalysis.score * 0.15 +
          contrast * 0.15
        );

        // Clarity: sharpness + edge detail + contrast
        const clarityScore = clamp(sharpness * 0.45 + contrast * 0.25 + edgeDensityScore * 0.15 + 15);

        // Composition: aspect ratio + resolution + symmetry + face centering
        let compScore = 40;
        if (aspectRatio > 0.5 && aspectRatio < 2.0) compScore += 15;
        if (aspectRatio > 0.7 && aspectRatio < 1.5) compScore += 10;
        if (img.width >= 600 && img.height >= 600) compScore += 10;
        if (symmetryAnalysis.symmetryScore > 60) compScore += 10;
        compScore += symmetryAnalysis.symmetryScore * 0.1;
        const compositionScore = clamp(compScore);

        // Background: edge density + contrast balance + color harmony
        const backgroundComplexityEstimate = clamp(
          edgeDensityScore * 0.35 +
          (100 - contrast) * 0.2 +
          (100 - colorAnalysis.harmonyScore) * 0.15 +
          zoneAnalysis.bgBrightness * 0.1
        );

        const overallImageQualityScore = clamp(
          lightingScore * 0.3 +
          clarityScore * 0.25 +
          compositionScore * 0.2 +
          resolutionScore * 0.1 +
          colorAnalysis.harmonyScore * 0.1 +
          symmetryAnalysis.symmetryScore * 0.05
        );

        resolve({
          width: img.width,
          height: img.height,
          aspectRatio: Math.round(aspectRatio * 100) / 100,
          brightness,
          contrast,
          saturation,
          sharpness,
          edgeDensity: edgeDensityScore,
          resolutionScore,
          lightingScore,
          clarityScore,
          compositionScore,
          backgroundComplexityEstimate,
          overallImageQualityScore,
          // ─── New fields ───
          faceDetected: faceZone.density > 0.01,
          faceBrightness: zoneAnalysis.faceBrightness,
          skinBrightness: faceZone.skinBrightness,
          lightingDirection: lightingAnalysis.direction,
          dominantHue: colorAnalysis.dominantHue,
          colorWarmth: colorAnalysis.warmth,
          colorHarmony: colorAnalysis.harmonyScore,
          imageDullness: colorAnalysis.dullness,
          symmetryScore: symmetryAnalysis.symmetryScore,
          subjectCenterX: faceZone.centerX / w,
          subjectCenterY: faceZone.centerY / h,
          backgroundBrightness: zoneAnalysis.bgBrightness,
          subjectBgContrast: zoneAnalysis.contrastRatio,
        });
      } catch {
        resolve(fallbackMetrics(img.width, img.height));
      }
    };
    img.onerror = () => {
      resolve(fallbackMetrics(0, 0));
    };
    img.src = dataUrl;
  });
}

function fallbackMetrics(w: number, h: number): ImageSignalMetrics {
  const aspect = w && h ? w / h : 1;
  return {
    width: w,
    height: h,
    aspectRatio: Math.round(aspect * 100) / 100,
    brightness: 50,
    contrast: 50,
    saturation: 50,
    sharpness: 50,
    edgeDensity: 50,
    resolutionScore: w && h ? clamp(((Math.min(w, 1200) / 1200) * 50 + (Math.min(h, 1200) / 1200) * 50) * 100) : 50,
    lightingScore: 50,
    clarityScore: 50,
    compositionScore: 50,
    backgroundComplexityEstimate: 50,
    overallImageQualityScore: 50,
    // ─── New fields (defaults) ───
    faceDetected: false,
    faceBrightness: 50,
    skinBrightness: 128,
    lightingDirection: "flat",
    dominantHue: "neutral",
    colorWarmth: 50,
    colorHarmony: 50,
    imageDullness: 30,
    symmetryScore: 50,
    subjectCenterX: 0.5,
    subjectCenterY: 0.5,
    backgroundBrightness: 50,
    subjectBgContrast: 20,
  };
}
