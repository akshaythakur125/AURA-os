import { CELEBRITY_TREND_PRESETS } from "@/config/celebrityTrendPresets";
import type { CelebrityTrendPreset } from "@/config/celebrityTrendPresets";

const COUNT = 6;

function getDateSeed(): number {
  const d = new Date();
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

function seededShuffle<T>(arr: T[], seed: number): T[] {
  const copy = [...arr];
  let s = seed;
  for (let i = copy.length - 1; i > 0; i--) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    const j = s % (i + 1);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function getRotatingPresets(): CelebrityTrendPreset[] {
  const seed = getDateSeed();
  const shuffled = seededShuffle(CELEBRITY_TREND_PRESETS, seed);
  return shuffled.slice(0, COUNT);
}

export function getMarqueePresets(): CelebrityTrendPreset[] {
  const subset = getRotatingPresets();
  return [...subset, ...subset];
}
