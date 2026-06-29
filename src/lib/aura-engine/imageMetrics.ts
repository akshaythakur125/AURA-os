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

        const lightingScore = clamp(
          brightness * 0.5 +
            (100 - Math.abs(brightness - 55)) * 0.3 +
            contrast * 0.2
        );

        const clarityScore = clamp(sharpness * 0.5 + contrast * 0.3 + 20);

        let compScore = 50;
        if (aspectRatio > 0.5 && aspectRatio < 2.0) compScore += 20;
        if (aspectRatio > 0.7 && aspectRatio < 1.5) compScore += 10;
        if (img.width >= 600 && img.height >= 600) compScore += 10;
        if (img.width >= 300 && img.height >= 300) compScore += 10;
        const compositionScore = clamp(compScore);

        const backgroundComplexityEstimate = clamp(
          edgeDensityScore * 0.4 + (100 - contrast) * 0.2 + saturation * 0.2
        );

        const overallImageQualityScore = clamp(
          lightingScore * 0.3 +
            clarityScore * 0.3 +
            compositionScore * 0.2 +
            resolutionScore * 0.1 +
            (100 - Math.abs(saturation - 50)) * 0.1
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
  };
}
