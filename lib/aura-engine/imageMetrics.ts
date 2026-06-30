import type { ImageMetrics } from "@/types";

const ANALYSIS_WIDTH = 256;

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function extractImageMetrics(imageDataUrl: string): Promise<ImageMetrics> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const scale = ANALYSIS_WIDTH / img.width;
        const width = ANALYSIS_WIDTH;
        const height = Math.round(img.height * scale);
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(getFallbackMetrics(img.width, img.height));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const imageData = ctx.getImageData(0, 0, width, height);
        const { data } = imageData;
        const pixelCount = width * height;

        let totalLuminance = 0;
        let totalSaturation = 0;
        const luminanceValues: number[] = [];

        for (let i = 0; i < pixelCount; i++) {
          const idx = i * 4;
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];
          const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
          totalLuminance += luminance;
          luminanceValues.push(luminance);
          const maxC = Math.max(r, g, b);
          const minC = Math.min(r, g, b);
          const saturation = maxC === 0 ? 0 : ((maxC - minC) / maxC) * 100;
          totalSaturation += saturation;
        }

        const brightness = clamp(totalLuminance / pixelCount, 0, 100);
        const avgLum = totalLuminance / pixelCount;
        let variance = 0;
        for (const l of luminanceValues) {
          variance += (l - avgLum) ** 2;
        }
        const contrast = clamp(Math.sqrt(variance / pixelCount), 0, 100);
        const saturation = clamp(totalSaturation / pixelCount, 0, 100);

        let sharpnessSum = 0;
        let edgeCount = 0;
        for (let y = 1; y < height - 1; y++) {
          for (let x = 1; x < width - 1; x++) {
            const leftIdx = (y * width + (x - 1)) * 4;
            const rightIdx = (y * width + (x + 1)) * 4;
            const upIdx = ((y - 1) * width + x) * 4;
            const downIdx = ((y + 1) * width + x) * 4;
            const left = 0.299 * data[leftIdx] + 0.587 * data[leftIdx + 1] + 0.114 * data[leftIdx + 2];
            const right = 0.299 * data[rightIdx] + 0.587 * data[rightIdx + 1] + 0.114 * data[rightIdx + 2];
            const up = 0.299 * data[upIdx] + 0.587 * data[upIdx + 1] + 0.114 * data[upIdx + 2];
            const down = 0.299 * data[downIdx] + 0.587 * data[downIdx + 1] + 0.114 * data[downIdx + 2];
            const gradX = Math.abs(right - left);
            const gradY = Math.abs(down - up);
            const grad = Math.sqrt(gradX * gradX + gradY * gradY);
            sharpnessSum += grad;
            if (grad > 15) edgeCount++;
          }
        }
        const totalPixels = (height - 2) * (width - 2);
        const sharpness = clamp((sharpnessSum / totalPixels) * 0.5, 0, 100);
        const edgeDensity = clamp((edgeCount / totalPixels) * 100, 0, 100);

        const lightingScore = clamp(brightness * 0.6 + (100 - Math.abs(brightness - 50)) * 0.4, 0, 100);
        const clarityScore = clamp(sharpness * 0.7 + (100 - edgeDensity * 0.5) * 0.3, 0, 100);
        const aspectRatio = img.width / img.height;
        const ratioScore = aspectRatio >= 0.75 && aspectRatio <= 1.6 ? 80 : 50;
        const resolutionScore = Math.min(100, (Math.min(img.width, img.height) / 400) * 100);
        const compositionScore = clamp(ratioScore * 0.6 + resolutionScore * 0.4, 0, 100);
        const backgroundComplexityEstimate = clamp(edgeDensity * 0.6 + contrast * 0.3 + saturation * 0.1, 0, 100);
        const qualityScore = clamp(
          lightingScore * 0.3 + clarityScore * 0.3 + compositionScore * 0.2 + (100 - Math.abs(contrast - 50)) * 0.1 + saturation * 0.1,
          0,
          100
        );

        resolve({
          width: img.width,
          height: img.height,
          aspectRatio: Math.round(aspectRatio * 100) / 100,
          brightness: Math.round(brightness),
          contrast: Math.round(contrast),
          saturation: Math.round(saturation),
          sharpness: Math.round(sharpness),
          edgeDensity: Math.round(edgeDensity),
          lightingScore: Math.round(lightingScore),
          clarityScore: Math.round(clarityScore),
          compositionScore: Math.round(compositionScore),
          backgroundComplexityEstimate: Math.round(backgroundComplexityEstimate),
          overallImageQualityScore: Math.round(qualityScore),
        });
      } catch {
        resolve(getFallbackMetrics(img.width, img.height));
      }
    };
    img.onerror = () => resolve(getFallbackMetrics(0, 0));
    img.src = imageDataUrl;
  });
}

function getFallbackMetrics(width: number, height: number): ImageMetrics {
  return {
    width,
    height,
    aspectRatio: width && height ? Math.round((width / height) * 100) / 100 : 1,
    brightness: 55,
    contrast: 45,
    saturation: 40,
    sharpness: 45,
    edgeDensity: 40,
    lightingScore: 55,
    clarityScore: 50,
    compositionScore: 55,
    backgroundComplexityEstimate: 50,
    overallImageQualityScore: 55,
  };
}
