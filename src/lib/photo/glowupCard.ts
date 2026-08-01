/**
 * Composes a shareable "glow-up card" from the Ready-to-Post before/after: the
 * user's original shot beside the auto-fixed one, their score, and a one-line
 * verdict, on-brand. It's a satisfying artifact for them AND a quiet growth
 * loop — every share carries the fixmyaura.shop mark back to new users.
 *
 * All canvas work, no network. The image is composited locally and never
 * leaves the device; sharing is always the user's explicit choice.
 */
import { planAutoFix, applyPixels, computeCrop, type AutoFixMetrics, type AutoFixPlan } from "./autoFix";

const W = 1080;
const H = 1350;
const TILE_W = 460;
const TILE_H = 575;
const RADIUS = 24;

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// Build a cropped tile canvas; when `fix` is given, the pixel correction is baked in.
function tileCanvas(img: HTMLImageElement, m: AutoFixMetrics, fix: AutoFixPlan | null): HTMLCanvasElement {
  const crop = computeCrop(img.width, img.height, TILE_W / TILE_H, m.subjectCenterX ?? 0.5, m.subjectCenterY ?? 0.42);
  const c = document.createElement("canvas");
  c.width = crop.sw; c.height = crop.sh;
  const ctx = c.getContext("2d")!;
  ctx.drawImage(img, crop.sx, crop.sy, crop.sw, crop.sh, 0, 0, crop.sw, crop.sh);
  if (fix) {
    try {
      const id = ctx.getImageData(0, 0, crop.sw, crop.sh);
      applyPixels(id.data, fix);
      ctx.putImageData(id, 0, 0);
    } catch { /* tainted canvas — leave the crop as-is */ }
  }
  return c;
}

function drawTile(ctx: CanvasRenderingContext2D, tile: HTMLCanvasElement, x: number, y: number, label: string, accent: boolean) {
  ctx.save();
  roundRect(ctx, x, y, TILE_W, TILE_H, RADIUS);
  ctx.clip();
  // cover-fit the tile canvas into the slot
  const scale = Math.max(TILE_W / tile.width, TILE_H / tile.height);
  const dw = tile.width * scale, dh = tile.height * scale;
  ctx.drawImage(tile, x + (TILE_W - dw) / 2, y + (TILE_H - dh) / 2, dw, dh);
  // label pill
  ctx.font = "700 22px -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif";
  const tw = ctx.measureText(label).width;
  ctx.fillStyle = accent ? "#E14434" : "rgba(28,25,23,0.82)";
  roundRect(ctx, x + 16, y + TILE_H - 48, tw + 28, 32, 16);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.fillText(label, x + 16 + 14, y + TILE_H - 26);
  ctx.restore();
}

function wrap(ctx: CanvasRenderingContext2D, text: string, maxW: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const t = line ? `${line} ${w}` : w;
    if (ctx.measureText(t).width > maxW && line) { lines.push(line); line = w; }
    else line = t;
  }
  if (line) lines.push(line);
  return lines.slice(0, 3);
}

export function composeGlowupCard(
  img: HTMLImageElement,
  metrics: AutoFixMetrics,
  opts: { score?: number | null; verdict?: string },
): HTMLCanvasElement {
  const plan = planAutoFix(metrics);
  const cv = document.createElement("canvas");
  cv.width = W; cv.height = H;
  const ctx = cv.getContext("2d")!;

  // Background
  ctx.fillStyle = "#FBF8F2";
  ctx.fillRect(0, 0, W, H);

  // Title
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "#1C1917";
  ctx.font = "800 56px -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("My AuraCheck glow-up", W / 2, 96);

  // Score pill
  if (typeof opts.score === "number") {
    const label = `AURA ${Math.round(opts.score)}/100`;
    ctx.font = "700 30px -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif";
    const pw = ctx.measureText(label).width + 44;
    ctx.fillStyle = "#E14434";
    roundRect(ctx, (W - pw) / 2, 122, pw, 50, 25);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.fillText(label, W / 2, 156);
  }

  // Before / after tiles
  const tileY = 210;
  const before = tileCanvas(img, metrics, null);
  const after = tileCanvas(img, metrics, plan);
  drawTile(ctx, before, 60, tileY, "BEFORE", false);
  drawTile(ctx, after, W - 60 - TILE_W, tileY, "AFTER", true);

  // Verdict
  ctx.textAlign = "center";
  ctx.fillStyle = "#33302b";
  ctx.font = "500 30px -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif";
  const verdict = (opts.verdict || "Same photo — better light, colour and crop.").trim();
  const lines = wrap(ctx, verdict, W - 160);
  let vy = tileY + TILE_H + 74;
  for (const ln of lines) { ctx.fillText(ln, W / 2, vy); vy += 40; }

  // Footer
  ctx.fillStyle = "#E14434";
  ctx.font = "800 34px -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif";
  ctx.fillText("fixmyaura.shop", W / 2, H - 84);
  ctx.fillStyle = "#9c9184";
  ctx.font = "500 22px -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif";
  ctx.fillText("On-device photo fix · your photo stayed private", W / 2, H - 48);

  ctx.textAlign = "left";
  return cv;
}
