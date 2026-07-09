import type { OutfitRegionEstimate } from "@/types/colorAnalysis";
import { extractDominantColors, extractCenterColors, extractEdgeColors } from "./extractDominantColors";

export function estimateOutfitRegion(imageData: ImageData): {
  outfitRegion: OutfitRegionEstimate | null;
  backgroundRegion: OutfitRegionEstimate | null;
} {
  try {
    const { width, height } = imageData;

    // Center/upper-center region (approximate outfit area)
    const outfitColors = extractCenterColors(imageData);
    const edgeColors = extractEdgeColors(imageData);
    const fullColors = extractDominantColors(imageData);

    // Compute metrics from full image
    let totalBrightness = 0;
    let totalSaturation = 0;
    let totalContrast = 0;
    let samples = 0;

    for (let y = 0; y < height; y += 4) {
      for (let x = 0; x < width; x += 4) {
        const idx = (y * width + x) * 4;
        const r = imageData.data[idx];
        const g = imageData.data[idx + 1];
        const b = imageData.data[idx + 2];
        const a = imageData.data[idx + 3];
        if (a < 128) continue;

        const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
        totalBrightness += luminance;

        const maxC = Math.max(r, g, b);
        const minC = Math.min(r, g, b);
        const saturation = maxC > 0 ? (maxC - minC) / maxC : 0;
        totalSaturation += saturation;
        totalContrast += maxC - minC;
        samples++;
      }
    }

    const avgBrightness = samples > 0 ? totalBrightness / samples : 128;
    const avgSaturation = samples > 0 ? (totalSaturation / samples) * 100 : 30;
    const avgContrast = samples > 0 ? totalContrast / samples : 50;

    // Estimate clutter from number of distinct color families
    const familyCount = new Set(fullColors.map((c) => c.family)).size;
    const estimatedClutter = Math.min(100, Math.max(0, (familyCount - 2) * 20));

    // Compute outfit/background contrast
    const outfitBrightness = outfitColors.length > 0
      ? 0.299 * outfitColors[0].rgb[0] + 0.587 * outfitColors[0].rgb[1] + 0.114 * outfitColors[0].rgb[2]
      : avgBrightness;
    const bgBrightness = edgeColors.length > 0
      ? 0.299 * edgeColors[0].rgb[0] + 0.587 * edgeColors[0].rgb[1] + 0.114 * edgeColors[0].rgb[2]
      : avgBrightness;

    const outfitBackgroundContrast = Math.abs(outfitBrightness - bgBrightness);

    // Confidence: lower if image is very small or has few samples
    const confidenceScore = Math.min(100, Math.max(10, Math.round((samples / 1000) * 50 + (width > 100 ? 30 : 0))));

    const outfitRegion: OutfitRegionEstimate = {
      regionName: "upper_center",
      dominantColors: outfitColors,
      brightness: Math.round(avgBrightness),
      saturation: Math.round(avgSaturation),
      contrast: Math.round(avgContrast),
      estimatedClutter: Math.round(estimatedClutter),
      confidenceScore,
    };

    const bgDominantColors = edgeColors.length > 0 ? edgeColors : fullColors.slice(1, 4);
    const backgroundRegion: OutfitRegionEstimate = {
      regionName: "full_frame_estimate",
      dominantColors: bgDominantColors,
      brightness: Math.round(bgBrightness),
      saturation: Math.round(avgSaturation * 0.8),
      contrast: Math.round(outfitBackgroundContrast),
      estimatedClutter: Math.round(estimatedClutter * 0.7),
      confidenceScore: Math.max(10, confidenceScore - 10),
    };

    return { outfitRegion, backgroundRegion };
  } catch {
    return { outfitRegion: null, backgroundRegion: null };
  }
}
