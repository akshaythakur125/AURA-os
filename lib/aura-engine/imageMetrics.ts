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
        let totalR = 0;
        let totalG = 0;
        let totalB = 0;
        const luminanceValues: number[] = [];

        const halfH = Math.floor(height / 2);
        let topLumSum = 0;
        let topCount = 0;
        let bottomLumSum = 0;
        let bottomCount = 0;

        const cx1 = Math.floor(width * 0.25);
        const cx2 = Math.floor(width * 0.75);
        const cy1 = Math.floor(height * 0.15);
        const cy2 = Math.floor(height * 0.65);
        let centerLumSum = 0;
        let centerCount = 0;
        let periLumSum = 0;
        let periCount = 0;

        let skinPixels = 0;
        let faceLumSum = 0;
        let faceCount = 0;

        for (let i = 0; i < pixelCount; i++) {
          const idx = i * 4;
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];
          const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
          totalLuminance += luminance;
          luminanceValues.push(luminance);
          totalR += r;
          totalG += g;
          totalB += b;

          const maxC = Math.max(r, g, b);
          const minC = Math.min(r, g, b);
          const saturation = maxC === 0 ? 0 : ((maxC - minC) / maxC) * 100;
          totalSaturation += saturation;

          const py = Math.floor(i / width);
          const px = i % width;

          if (py < halfH) {
            topLumSum += luminance;
            topCount++;
          } else {
            bottomLumSum += luminance;
            bottomCount++;
          }

          const inCenter = px >= cx1 && px <= cx2 && py >= cy1 && py <= cy2;
          if (inCenter) {
            centerLumSum += luminance;
            centerCount++;
          } else {
            periLumSum += luminance;
            periCount++;
          }

          if (isSkinTone(r, g, b)) {
            skinPixels++;
            if (inCenter || (py >= cy1 && py <= cy2)) {
              faceLumSum += luminance;
              faceCount++;
            }
          }
        }

        const brightness = clamp(totalLuminance / pixelCount, 0, 100);
        const avgLum = totalLuminance / pixelCount;
        let variance = 0;
        for (const l of luminanceValues) {
          variance += (l - avgLum) ** 2;
        }
        const contrast = clamp(Math.sqrt(variance / pixelCount), 0, 100);
        const saturation = clamp(totalSaturation / pixelCount, 0, 100);

        const topBrightness = topCount > 0 ? clamp(topLumSum / topCount, 0, 255) : brightness;
        const bottomBrightness = bottomCount > 0 ? clamp(bottomLumSum / bottomCount, 0, 255) : brightness;
        const centerBrightness = centerCount > 0 ? clamp(centerLumSum / centerCount, 0, 255) : brightness;
        const peripheryBrightness = periCount > 0 ? clamp(periLumSum / periCount, 0, 255) : brightness;

        let sharpnessSum = 0;
        let edgeCount = 0;
        let centerSharpSum = 0;
        let centerSharpPixels = 0;
        let periEdgeCount = 0;
        let periEdgePixels = 0;

        let topEdge = 0;
        let bottomEdge = 0;
        let leftEdge = 0;
        let rightEdge = 0;
        const halfW = Math.floor(width / 2);

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
            const isEdge = grad > 15;
            if (isEdge) edgeCount++;

            const inCenter = x >= cx1 && x <= cx2 && y >= cy1 && y <= cy2;
            if (inCenter) {
              centerSharpSum += grad;
              centerSharpPixels++;
            } else {
              if (isEdge) periEdgeCount++;
              periEdgePixels++;

              if (isEdge) {
                if (y < halfH) topEdge++;
                else bottomEdge++;
                if (x < halfW) leftEdge++;
                else rightEdge++;
              }
            }
          }
        }

        const totalPixels = (height - 2) * (width - 2);
        const sharpness = clamp((sharpnessSum / totalPixels) * 0.5, 0, 100);
        const edgeDensity = clamp((edgeCount / totalPixels) * 100, 0, 100);
        const centerSharpness = centerSharpPixels > 0 ? clamp((centerSharpSum / centerSharpPixels) * 0.5, 0, 100) : sharpness;
        const peripheryEdgeDensity = periEdgePixels > 0 ? clamp((periEdgeCount / periEdgePixels) * 100, 0, 100) : edgeDensity;

        const lightingDirection = detectLightingDirection(topBrightness, bottomBrightness, centerBrightness, peripheryBrightness);

        const totalPeriEdge = topEdge + bottomEdge + leftEdge + rightEdge;
        const backgroundClutterZone = detectClutterZone(topEdge, bottomEdge, leftEdge, rightEdge, totalPeriEdge, peripheryEdgeDensity);

        const subjectContrast = Math.abs(centerBrightness - peripheryBrightness);

        const avgR = totalR / pixelCount;
        const avgG = totalG / pixelCount;
        const avgB = totalB / pixelCount;
        const colorTemperature = clamp(((avgR - avgB) / 255) * 100 + 50, 0, 100);
        const warmth = clamp(((avgR * 0.6 + avgG * 0.3 - avgB * 0.4) / 255) * 100, 0, 100);

        const skinTonePresent = (skinPixels / pixelCount) > 0.05;
        const faceRegionBrightness = faceCount > 0 ? clamp(faceLumSum / faceCount, 0, 255) : undefined;

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

        // ponytail: extract enhanced analysis fields
        const dominantColors = extractDominantColors(data, pixelCount, width, height);
        const upperBodyColor = extractRegionColors(data, width, height, 0.25, 0.55);
        const lowerBodyColor = extractRegionColors(data, width, height, 0.55, 0.85);
        const colorHarmonyScore = computeColorHarmony(dominantColors);
        const colorMood = computeColorMood(avgR, avgG, avgB, saturation);
        const ruleOfThirdsScore = computeRuleOfThirds(skinPixels, pixelCount, width, height, data);
        const textureComplexity = clamp(edgeDensity * 0.7 + contrast * 0.3, 0, 100);
        const outfitColorContrast = clamp(Math.abs(centerBrightness - peripheryBrightness) * 0.6 + contrast * 0.4, 0, 100);
        const styleArchetype = detectStyleArchetype(saturation, contrast, edgeDensity, warmth, brightness);

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
          topBrightness: Math.round(topBrightness),
          bottomBrightness: Math.round(bottomBrightness),
          centerBrightness: Math.round(centerBrightness),
          peripheryBrightness: Math.round(peripheryBrightness),
          centerSharpness: Math.round(centerSharpness),
          peripheryEdgeDensity: Math.round(peripheryEdgeDensity),
          colorTemperature: Math.round(colorTemperature),
          skinTonePresent,
          faceRegionBrightness: faceRegionBrightness !== undefined ? Math.round(faceRegionBrightness) : undefined,
          lightingDirection,
          backgroundClutterZone,
          subjectContrast: Math.round(subjectContrast),
          warmth: Math.round(warmth),
          dominantColors,
          upperBodyColor,
          lowerBodyColor,
          colorHarmonyScore: Math.round(colorHarmonyScore),
          colorMood,
          ruleOfThirdsScore: Math.round(ruleOfThirdsScore),
          textureComplexity: Math.round(textureComplexity),
          outfitColorContrast: Math.round(outfitColorContrast),
          styleArchetype,
        });
      } catch {
        resolve(getFallbackMetrics(img.width, img.height));
      }
    };
    img.onerror = () => resolve(getFallbackMetrics(0, 0));
    img.src = imageDataUrl;
  });
}

function isSkinTone(r: number, g: number, b: number): boolean {
  return r > 95 && g > 40 && b > 20 &&
    r > g && r > b &&
    (r - g) > 15 &&
    Math.abs(r - g) < 120 &&
    (r - b) > 15;
}

function detectLightingDirection(
  topB: number, bottomB: number, centerB: number, periB: number
): ImageMetrics["lightingDirection"] {
  const vertDiff = topB - bottomB;
  const subjectDiff = centerB - periB;

  if (subjectDiff < -30) return "backlit";
  if (vertDiff > 25) return "overhead";
  if (vertDiff < -20) return "underlit";
  if (Math.abs(vertDiff) <= 15 && Math.abs(subjectDiff) <= 15) return "even";
  return "even";
}

function detectClutterZone(
  topEdge: number, bottomEdge: number, leftEdge: number, rightEdge: number,
  totalPeriEdge: number, periEdgeDensity: number
): ImageMetrics["backgroundClutterZone"] {
  if (periEdgeDensity < 15) return "none";

  if (totalPeriEdge === 0) return "none";
  const topRatio = topEdge / totalPeriEdge;
  const bottomRatio = bottomEdge / totalPeriEdge;
  const sidesBalance = Math.abs(leftEdge - rightEdge) / totalPeriEdge;

  if (topRatio > 0.55) return "top";
  if (bottomRatio > 0.55) return "bottom";
  if (sidesBalance > 0.3) return "sides";
  if (periEdgeDensity > 25) return "full";
  return "none";
}

// ponytail: color name mapping for dominant colors
const COLOR_NAMES: [string, [number, number, number]][] = [
  ["black", [30, 30, 30]], ["white", [240, 240, 240]], ["red", [200, 50, 50]],
  ["blue", [50, 80, 180]], ["green", [50, 150, 70]], ["yellow", [230, 210, 60]],
  ["orange", [220, 130, 40]], ["pink", [210, 120, 150]], ["purple", [120, 60, 170]],
  ["brown", [140, 90, 50]], ["grey", [130, 130, 130]], ["beige", [200, 185, 160]],
  ["navy", [30, 50, 100]], ["maroon", [120, 30, 50]], ["olive", [100, 110, 50]],
  ["teal", [50, 140, 140]], ["cream", [230, 220, 190]], ["lavender", [170, 150, 200]],
  ["burgundy", [100, 25, 45]], ["charcoal", [65, 65, 65]], ["khaki", [170, 160, 120]],
  ["coral", [220, 100, 80]], ["mustard", [200, 170, 50]], ["rust", [170, 80, 40]],
];

function closestColorName(r: number, g: number, b: number): string {
  let best = "unknown", bestDist = Infinity;
  for (const [name, [cr, cg, cb]] of COLOR_NAMES) {
    const d = (r - cr) ** 2 + (g - cg) ** 2 + (b - cb) ** 2;
    if (d < bestDist) { bestDist = d; best = name; }
  }
  return best;
}

function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map(c => c.toString(16).padStart(2, "0")).join("");
}

function extractDominantColors(data: Uint8ClampedArray, pixelCount: number, width: number, height: number) {
  // ponytail: simple k-means-lite — bucket pixels into 8×8×8 bins, pick top 5
  const bins = new Map<string, { r: number; g: number; b: number; count: number }>();
  for (let i = 0; i < pixelCount; i++) {
    const idx = i * 4;
    const r = data[idx] >> 5, g = data[idx + 1] >> 5, b = data[idx + 2] >> 5;
    const key = `${r},${g},${b}`;
    const existing = bins.get(key);
    if (existing) { existing.count++; existing.r += data[idx]; existing.g += data[idx + 1]; existing.b += data[idx + 2]; }
    else bins.set(key, { r: data[idx], g: data[idx + 1], b: data[idx + 2], count: 1 });
  }
  const sorted = [...bins.values()].sort((a, b) => b.count - a.count).slice(0, 8);
  const total = sorted.reduce((s, b) => s + b.count, 0);
  return sorted.map(b => ({
    hex: rgbToHex(Math.round(b.r / b.count), Math.round(b.g / b.count), Math.round(b.b / b.count)),
    percent: Math.round((b.count / total) * 100),
    region: "full" as const,
  }));
}

function extractRegionColors(data: Uint8ClampedArray, width: number, height: number, yStart: number, yEnd: number) {
  let rSum = 0, gSum = 0, bSum = 0, count = 0;
  const xStart = Math.floor(width * 0.2), xEnd = Math.floor(width * 0.8);
  for (let y = Math.floor(height * yStart); y < Math.floor(height * yEnd); y++) {
    for (let x = xStart; x < xEnd; x++) {
      const idx = (y * width + x) * 4;
      rSum += data[idx]; gSum += data[idx + 1]; bSum += data[idx + 2]; count++;
    }
  }
  if (!count) return undefined;
  const r = Math.round(rSum / count), g = Math.round(gSum / count), b = Math.round(bSum / count);
  return { hex: rgbToHex(r, g, b), name: closestColorName(r, g, b) };
}

function computeColorHarmony(dominantColors: { hex: string; percent: number }[]): number {
  // ponytail: simple harmony — fewer dominant colors = more harmonious
  if (dominantColors.length <= 2) return 85;
  if (dominantColors.length <= 3) return 70;
  if (dominantColors.length <= 5) return 55;
  return 40;
}

function computeColorMood(avgR: number, avgG: number, avgB: number, saturation: number): ImageMetrics["colorMood"] {
  const warmth = (avgR * 0.6 + avgG * 0.3 - avgB * 0.4) / 255;
  if (saturation > 60) return "high_energy";
  if (saturation < 20) return "muted";
  if (warmth > 0.15) return "warm";
  if (warmth < -0.05) return "cool";
  return "neutral";
}

function computeRuleOfThirds(skinPixels: number, pixelCount: number, width: number, height: number, data: Uint8ClampedArray): number {
  // ponytail: check if skin-tone pixels cluster near rule-of-thirds intersections
  const thirdW = width / 3, thirdH = height / 3;
  const zones = new Array(9).fill(0);
  for (let i = 0; i < pixelCount; i++) {
    if (!isSkinTone(data[i * 4], data[i * 4 + 1], data[i * 4 + 2])) continue;
    const px = i % width, py = Math.floor(i / width);
    const col = Math.min(2, Math.floor(px / thirdW));
    const row = Math.min(2, Math.floor(py / thirdH));
    zones[row * 3 + col]++;
  }
  const hotspots = [zones[0], zones[2], zones[6], zones[8]]; // corners = thirds intersections
  const center = zones[4];
  const hotSum = hotspots.reduce((a, b) => a + b, 0);
  if (skinPixels === 0) return 50;
  const hotRatio = hotSum / skinPixels;
  const centerRatio = center / skinPixels;
  // Good: subject near intersections, not dead center
  return Math.round(clamp(50 + hotRatio * 80 - centerRatio * 30, 20, 95));
}

function detectStyleArchetype(saturation: number, contrast: number, edgeDensity: number, warmth: number, brightness: number): ImageMetrics["styleArchetype"] {
  if (saturation < 25 && contrast < 40) return "minimal";
  if (saturation > 55 && contrast > 50) return "bold";
  if (brightness > 60 && warmth > 50 && saturation < 45) return "classic";
  if (edgeDensity > 35 && contrast > 45) return "street";
  if (brightness > 55 && saturation < 30 && contrast > 35) return "formal";
  return "eclectic";
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
    dominantColors: [{ hex: "#808080", percent: 100, region: "full" }],
    colorHarmonyScore: 50,
    colorMood: "neutral",
    ruleOfThirdsScore: 50,
    visualWeightBalance: 50,
    textureComplexity: 40,
    outfitColorContrast: 40,
    styleArchetype: "eclectic",
  };
}
