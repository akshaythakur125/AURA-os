export type ColorFamily =
  | "black" | "white" | "grey" | "navy" | "blue" | "brown" | "beige"
  | "green" | "red" | "maroon" | "yellow" | "orange" | "pink" | "purple"
  | "neutral" | "unknown";

export interface DominantColor {
  hex: string;
  rgb: [number, number, number];
  percentage: number;
  label: string;
  family: ColorFamily;
}

export interface OutfitRegionEstimate {
  regionName: "upper_center" | "lower_center" | "full_frame_estimate";
  dominantColors: DominantColor[];
  brightness: number;
  saturation: number;
  contrast: number;
  estimatedClutter: number;
  confidenceScore: number;
}

export interface ColorHarmonyResult {
  outfitBackgroundContrast: number;
  paletteConsistency: number;
  saturationBalance: number;
  neutralBalance: number;
  premiumMinimalPotential: number;
  creatorBoldPotential: number;
  professionalCleanPotential: number;
  datingWarmPotential: number;
  overallHarmonyScore: number;
}

export interface AnalyzedRegion {
  pixels: number[][];
  dominantColors: DominantColor[];
  avgBrightness: number;
  avgSaturation: number;
  colorVariance: number;
}
