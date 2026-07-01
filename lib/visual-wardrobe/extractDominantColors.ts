import type { DominantColor, ColorFamily } from "@/types/colorAnalysis";

const SAMPLE_INTERVAL = 4;
const COLOR_FAMILIES: Record<ColorFamily, { ranges: [number, number, number, number, number, number][]; label: string }> = {
  black: { ranges: [[0, 50, 0, 50, 0, 50]], label: "black" },
  white: { ranges: [[200, 255, 200, 255, 200, 255]], label: "white" },
  grey: { ranges: [[80, 199, 80, 199, 80, 199]], label: "grey" },
  navy: { ranges: [[0, 60, 0, 80, 80, 180]], label: "navy" },
  blue: { ranges: [[0, 100, 50, 180, 150, 255]], label: "blue" },
  brown: { ranges: [[80, 180, 40, 120, 0, 80]], label: "brown" },
  beige: { ranges: [[180, 230, 160, 210, 120, 180]], label: "beige" },
  green: { ranges: [[0, 100, 100, 200, 0, 100]], label: "green" },
  red: { ranges: [[150, 255, 0, 80, 0, 80]], label: "red" },
  maroon: { ranges: [[80, 150, 0, 50, 0, 50]], label: "maroon" },
  yellow: { ranges: [[200, 255, 180, 255, 0, 100]], label: "yellow" },
  orange: { ranges: [[200, 255, 100, 180, 0, 80]], label: "orange" },
  pink: { ranges: [[200, 255, 100, 180, 150, 255]], label: "pink" },
  purple: { ranges: [[100, 200, 0, 100, 150, 255]], label: "purple" },
  neutral: { ranges: [[100, 200, 80, 180, 60, 160]], label: "neutral" },
  unknown: { ranges: [[0, 255, 0, 255, 0, 255]], label: "unknown" },
};

function classifyColor(r: number, g: number, b: number): ColorFamily {
  // Check black (very dark)
  if (r < 60 && g < 60 && b < 60) return "black";
  // Check white (very light)
  if (r > 220 && g > 220 && b > 220) return "white";

  for (const [family, info] of Object.entries(COLOR_FAMILIES)) {
    if (family === "black" || family === "white" || family === "unknown") continue;
    for (const range of info.ranges) {
      const rMin = range[0], rMax = range[1], gMin = range[2], gMax = range[3], bMin = range[4], bMax = range[5];
      if (r >= rMin && r <= rMax && g >= gMin && g <= gMax && b >= bMin && b <= bMax) {
        return family as ColorFamily;
      }
    }
  }
  // Check grey (desaturated)
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (max - min < 30 && r > 60) return "grey";
  // Check navy
  if (b > r && b > g && r < 80 && b > 80) return "navy";
  // Check brown
  if (r > g && g > b && r > 60 && r < 180) return "brown";

  return "unknown";
}

function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map((c) => c.toString(16).padStart(2, "0")).join("");
}

export function extractDominantColors(imageData: ImageData, sampleInterval = SAMPLE_INTERVAL): DominantColor[] {
  const { data, width, height } = imageData;
  const colorCounts = new Map<string, { count: number; r: number; g: number; b: number }>();
  let totalSampled = 0;

  for (let y = 0; y < height; y += sampleInterval) {
    for (let x = 0; x < width; x += sampleInterval) {
      const idx = (y * width + x) * 4;
      const a = data[idx + 3];
      if (a < 128) continue; // Skip transparent

      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      // Quantize to reduce noise
      const qr = Math.round(r / 16) * 16;
      const qg = Math.round(g / 16) * 16;
      const qb = Math.round(b / 16) * 16;
      const key = `${qr},${qg},${qb}`;

      const existing = colorCounts.get(key);
      if (existing) {
        existing.count++;
      } else {
        colorCounts.set(key, { count: 1, r, g, b });
      }
      totalSampled++;
    }
  }

  if (totalSampled === 0) return [];

  // Sort by count descending
  const sorted = Array.from(colorCounts.entries())
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 8);

  // Group similar colors by family
  const familyGroups = new Map<string, { r: number; g: number; b: number; count: number }[]>();
  for (const entry of sorted) {
    const { count, r, g, b } = entry[1];
    const family = classifyColor(r, g, b);
    if (!familyGroups.has(family)) familyGroups.set(family, []);
    familyGroups.get(family)!.push({ r, g, b, count });
  }

  // Pick the top representative from each family
  const result: DominantColor[] = [];
  for (const [family, colors] of familyGroups) {
    const totalCount = colors.reduce((s, c) => s + c.count, 0);
    const avgR = Math.round(colors.reduce((s, c) => s + c.r * c.count, 0) / totalCount);
    const avgG = Math.round(colors.reduce((s, c) => s + c.g * c.count, 0) / totalCount);
    const avgB = Math.round(colors.reduce((s, c) => s + c.b * c.count, 0) / totalCount);

    result.push({
      hex: rgbToHex(avgR, avgG, avgB),
      rgb: [avgR, avgG, avgB],
      percentage: Math.round((totalCount / totalSampled) * 100),
      label: COLOR_FAMILIES[family as ColorFamily]?.label || family,
      family: family as ColorFamily,
    });
  }

  return result.sort((a, b) => b.percentage - a.percentage).slice(0, 6);
}

export function extractCenterColors(imageData: ImageData): DominantColor[] {
  const { width, height } = imageData;
  const centerX = Math.floor(width * 0.25);
  const centerY = Math.floor(height * 0.2);
  const cw = Math.floor(width * 0.5);
  const ch = Math.floor(height * 0.4);

  const canvas2 = document.createElement("canvas");
  canvas2.width = cw;
  canvas2.height = ch;
  const ctx2 = canvas2.getContext("2d");
  if (!ctx2) return [];

  const srcCanvas = document.createElement("canvas");
  srcCanvas.width = width;
  srcCanvas.height = height;
  const srcCtx = srcCanvas.getContext("2d");
  if (!srcCtx) return [];

  const tempData = new ImageData(
    new Uint8ClampedArray(imageData.data),
    width, height
  );
  srcCtx.putImageData(tempData, 0, 0);
  ctx2.drawImage(srcCanvas, centerX, centerY, cw, ch, 0, 0, cw, ch);
  const centerImageData = ctx2.getImageData(0, 0, cw, ch);

  return extractDominantColors(centerImageData);
}

export function extractEdgeColors(imageData: ImageData): DominantColor[] {
  const { width, height } = imageData;
  const edgeSize = Math.floor(Math.min(width, height) * 0.1);

  // Sample from top, bottom, left, right edges
  const edgePixelData: number[] = [];
  const pushPixel = (x: number, y: number) => {
    const idx = (y * width + x) * 4;
    if (imageData.data[idx + 3] >= 128) {
      edgePixelData.push(imageData.data[idx], imageData.data[idx + 1], imageData.data[idx + 2]);
    }
  };

  for (let x = 0; x < width; x += SAMPLE_INTERVAL) {
    for (let e = 0; e < edgeSize; e += SAMPLE_INTERVAL) {
      pushPixel(x, e);
      pushPixel(x, height - 1 - e);
    }
  }
  for (let y = edgeSize; y < height - edgeSize; y += SAMPLE_INTERVAL) {
    for (let e = 0; e < edgeSize; e += SAMPLE_INTERVAL) {
      pushPixel(e, y);
      pushPixel(width - 1 - e, y);
    }
  }

  // Build a small canvas from edge pixels
  const edgeCount = edgePixelData.length / 3;
  if (edgeCount === 0) return [];

  const edgeCanvas = document.createElement("canvas");
  edgeCanvas.width = Math.min(edgeCount, 100);
  edgeCanvas.height = 1;
  const eCtx = edgeCanvas.getContext("2d");
  if (!eCtx) return [];

  const eImageData = eCtx.createImageData(edgeCanvas.width, 1);
  for (let i = 0; i < edgeCanvas.width && i < edgeCount; i++) {
    eImageData.data[i * 4] = edgePixelData[i * 3];
    eImageData.data[i * 4 + 1] = edgePixelData[i * 3 + 1];
    eImageData.data[i * 4 + 2] = edgePixelData[i * 3 + 2];
    eImageData.data[i * 4 + 3] = 255;
  }

  return extractDominantColors(eImageData);
}
