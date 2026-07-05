import { CELEBRITY_TREND_PRESETS } from "@/config/celebrityTrendPresets";
import type { CelebrityTrendPreset } from "@/config/celebrityTrendPresets";

const COUNT = 13;
const ROTATION_WINDOW_MS = 72 * 60 * 60 * 1000;

// Stable per-72h-window seed, based on UTC epoch time rather than local
// calendar date fields (getFullYear/getMonth/getDate reflect the runtime's
// local timezone, which differs between the server -- UTC -- and each
// visitor's browser; using those would pick a different rotation on the
// server than on the client's first paint, a hydration mismatch).
function getRotationSeed(): number {
  return Math.floor(Date.now() / ROTATION_WINDOW_MS);
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
  const seed = getRotationSeed();
  const shuffled = seededShuffle(CELEBRITY_TREND_PRESETS, seed);
  return shuffled.slice(0, COUNT);
}

export function getMarqueePresets(): CelebrityTrendPreset[] {
  const subset = getRotatingPresets();
  return [...subset, ...subset];
}

// Deterministic rotating subset for any list (e.g. the homepage proof
// gallery). Reuses the same UTC-epoch window seed as the presets so the
// server and the client's first paint pick the same items (no hydration
// mismatch).
export function getDailySubset<T>(items: T[], count: number): T[] {
  const seed = getRotationSeed();
  const shuffled = seededShuffle(items, seed);
  return shuffled.slice(0, count);
}
