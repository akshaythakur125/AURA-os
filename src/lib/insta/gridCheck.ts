/**
 * Grid Check — score a whole Instagram presence, not one photo.
 *
 * A visitor decides whether to follow in ~2 seconds, scanning the 9-tile grid
 * as one image: is it cohesive, or does it jump between dark/bright and
 * warm/cool at random? Single-photo tools miss this entirely. Given cheap
 * per-tile colour stats (extracted on-canvas in the browser, so nothing leaves
 * the device), this computes grid cohesion, the outlier tile dragging it down,
 * which shot should lead top-left, and the palette — the "assess my profile"
 * payoff, without ever touching an Instagram login.
 *
 * Pure and deterministic: statsFromImageData() reduces a pixel buffer to a
 * TileStats; buildGridCheck() turns the tiles into the verdict. Both testable.
 */

export interface TileStats {
  brightness: number; // 0–100
  warmth: number;     // −100 (cool) .. +100 (warm)
  saturation: number; // 0–100
  sharpness: number;  // 0–100 (relative)
}

export interface GridCheckResult {
  cohesion: number;        // 0–100 — how much the grid reads as one person
  cohesionLabel: string;
  leadIndex: number;       // tile that should sit top-left
  weakIndex: number;       // outlier tile hurting cohesion the most
  palette: "warm" | "cool" | "neutral" | "mixed";
  verdict: string;
  tips: string[];
}

/** Reduce an RGBA buffer to the four stats the grid analysis needs. */
export function statsFromImageData(data: Uint8ClampedArray, w: number, h: number): TileStats {
  let sumL = 0, sumRB = 0, sumSat = 0, n = 0;
  const luma = (i: number) => 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    sumL += 0.299 * r + 0.587 * g + 0.114 * b;
    sumRB += r - b;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    sumSat += max === 0 ? 0 : (max - min) / max;
    n++;
  }
  // Sharpness: average horizontal luma gradient (relative crispness proxy).
  let grad = 0, gn = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w - 1; x++) {
      const i = (y * w + x) * 4;
      grad += Math.abs(luma(i) - luma(i + 4));
      gn++;
    }
  }
  const clamp = (v: number, lo: number, hi: number) => (v < lo ? lo : v > hi ? hi : v);
  return {
    brightness: clamp((sumL / n / 255) * 100, 0, 100),
    warmth: clamp((sumRB / n) * 0.6, -100, 100),
    saturation: clamp((sumSat / n) * 100, 0, 100),
    sharpness: clamp((grad / Math.max(1, gn)) * 2.4, 0, 100),
  };
}

function mean(xs: number[]): number { return xs.reduce((s, x) => s + x, 0) / xs.length; }
function std(xs: number[], m: number): number { return Math.sqrt(mean(xs.map((x) => (x - m) ** 2))); }

export function buildGridCheck(tiles: TileStats[]): GridCheckResult {
  const n = tiles.length;
  const bs = tiles.map((t) => t.brightness);
  const ws = tiles.map((t) => t.warmth);
  const ss = tiles.map((t) => t.saturation);
  const mB = mean(bs), mW = mean(ws), mS = mean(ss);
  const sB = std(bs, mB), sW = std(ws, mW), sS = std(ss, mS);

  const clamp = (v: number, lo: number, hi: number) => (v < lo ? lo : v > hi ? hi : v);
  // Tighter spread → higher cohesion. Scaled so a "tight" grid lands ~80+.
  const cohesion = n < 2 ? 100 : Math.round(clamp(100 - (sB * 1.7 + sW * 1.6 + sS * 1.7), 0, 100));
  const cohesionLabel = cohesion >= 78 ? "Cohesive — reads as one person" : cohesion >= 58 ? "Mostly consistent" : cohesion >= 40 ? "A bit scattered" : "All over the place";

  // Outlier: the tile furthest from the grid's average look.
  const dist = tiles.map((t) => Math.abs(t.brightness - mB) / 25 + Math.abs(t.warmth - mW) / 25 + Math.abs(t.saturation - mS) / 25);
  let weakIndex = 0;
  for (let i = 1; i < n; i++) if (dist[i] > dist[weakIndex]) weakIndex = i;

  // Lead: sharpest, best-exposed, reasonably colourful — but not the outlier.
  const quality = tiles.map((t) => t.sharpness * 0.5 + (100 - Math.abs(t.brightness - 62)) * 0.3 + t.saturation * 0.2);
  let leadIndex = 0;
  for (let i = 1; i < n; i++) if (quality[i] > quality[leadIndex]) leadIndex = i;
  if (leadIndex === weakIndex && n > 1) {
    // second best
    let second = -1;
    for (let i = 0; i < n; i++) if (i !== weakIndex && (second < 0 || quality[i] > quality[second])) second = i;
    if (second >= 0) leadIndex = second;
  }

  const palette: GridCheckResult["palette"] = sW > 28 ? "mixed" : mW > 12 ? "warm" : mW < -12 ? "cool" : "neutral";

  const tips: string[] = [];
  if (n >= 3 && cohesion < 62) {
    const brightScatter = sB > 18;
    const toneScatter = sW > 22;
    tips.push(
      `Your grid jumps around${brightScatter ? " in brightness" : ""}${brightScatter && toneScatter ? " and" : ""}${toneScatter ? " between warm and cool tones" : ""} — pick ONE edit recipe and run it on every post so the grid reads as one aesthetic.`,
    );
  }
  if (n >= 3 && cohesion < 78 && weakIndex !== leadIndex) {
    const t = tiles[weakIndex];
    const why = Math.abs(t.brightness - mB) > Math.abs(t.warmth - mW)
      ? (t.brightness < mB ? "much darker than the rest" : "much brighter than the rest")
      : (t.warmth > mW ? "much warmer than the rest" : "much cooler than the rest");
    tips.push(`Tile #${weakIndex + 1} is the outlier — it's ${why}. Re-edit it to match, or swap it out; one odd tile breaks the whole grid.`);
  }
  tips.push(`Put tile #${leadIndex + 1} top-left — it's your sharpest, best-lit shot, and the top-left tile is the first thing every visitor's eye lands on.`);
  if (palette === "mixed") tips.push("No consistent palette yet — commit to warm OR cool across your next posts and your feed will instantly look more intentional.");
  else if (palette !== "neutral") tips.push(`Your feed leans ${palette} — lean into it. Keep new posts in the same temperature and the cohesion score climbs on its own.`);

  const verdict = n < 3
    ? "Add at least 3 recent posts to see how your grid reads as a whole."
    : cohesion >= 78
      ? "Strong, cohesive grid — a visitor reads it as one clear aesthetic in the first two seconds. Keep the palette and editing consistent."
      : cohesion >= 58
        ? "Decent grid with a couple of tiles pulling against the rest. Tighten the outliers and you'll look markedly more put-together."
        : "Your grid is doing you a disservice — it reads as random posts, not a person with a look. The fixes below are the fastest way to a feed people follow.";

  return { cohesion, cohesionLabel, leadIndex, weakIndex, palette, verdict, tips };
}
