/**
 * Fine-grained skin read, anchored to real MediaPipe landmarks.
 *
 * Everything here is measured from pixels in precisely located regions
 * (cheeks, under-eyes, T-zone) — no guessing. What we deliberately DON'T do:
 * count individual spots or diagnose acne. Spot-level detection is not
 * reliable from a compressed phone photo without a trained model, and a wrong
 * "you have acne" is worse than no answer. We report what we can stand behind:
 * evenness, blemish-ish local variation, shine, and under-eye shadow.
 */

export interface SkinDetail {
  /** 0–100 overall skin clarity (even tone + low blemish variation). */
  clarity: number;
  /** 0–100 how uniform the skin tone reads across both cheeks. */
  evenness: number;
  /** 0–100 shine/oiliness on the T-zone (higher = shinier). */
  shine: number;
  /** 0–100 under-eye darkness vs cheek (higher = darker circles). */
  underEye: number;
  /** 0–100 fine texture/roughness signal. */
  texture: number;
  /** Short, honest, user-facing notes. */
  notes: string[];
  /** The single highest-impact skin/photo fix. */
  topFix: string;
  /** True when lighting/resolution make a skin read unreliable. */
  lowConfidence: boolean;
}

type Box = { x0: number; y0: number; x1: number; y1: number };
type Pt = [number, number];

const clamp = (n: number) => Math.max(0, Math.min(100, n));

function lum(d: Uint8ClampedArray, i: number) {
  return 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];
}

/** Sample a normalized rect: mean luminance, luminance stdDev, mean RGB, count. */
function sampleRect(
  d: Uint8ClampedArray,
  W: number,
  H: number,
  r: Box,
  isSkin?: (r: number, g: number, b: number) => boolean
) {
  const x0 = Math.max(0, Math.floor(r.x0 * W));
  const x1 = Math.min(W, Math.ceil(r.x1 * W));
  const y0 = Math.max(0, Math.floor(r.y0 * H));
  const y1 = Math.min(H, Math.ceil(r.y1 * H));
  const vals: number[] = [];
  let rs = 0, gs = 0, bs = 0, n = 0;
  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      const i = (y * W + x) * 4;
      if (isSkin && !isSkin(d[i], d[i + 1], d[i + 2])) continue;
      vals.push(lum(d, i));
      rs += d[i]; gs += d[i + 1]; bs += d[i + 2]; n++;
    }
  }
  if (n === 0) return null;
  const mean = vals.reduce((s, v) => s + v, 0) / n;
  const sd = Math.sqrt(vals.reduce((s, v) => s + (v - mean) * (v - mean), 0) / n);
  return { mean, sd, r: rs / n, g: gs / n, b: bs / n, n };
}

/**
 * Local blemish-ish variation: how much small patches deviate from their
 * neighbourhood. High values mean uneven, spotty-looking skin — we describe it
 * as "unevenness", never as a diagnosis.
 */
function localVariation(d: Uint8ClampedArray, W: number, H: number, r: Box): number {
  const x0 = Math.max(0, Math.floor(r.x0 * W));
  const x1 = Math.min(W, Math.ceil(r.x1 * W));
  const y0 = Math.max(0, Math.floor(r.y0 * H));
  const y1 = Math.min(H, Math.ceil(r.y1 * H));
  const step = 3;
  let acc = 0, n = 0;
  for (let y = y0 + step; y < y1 - step; y += step) {
    for (let x = x0 + step; x < x1 - step; x += step) {
      const c = lum(d, (y * W + x) * 4);
      const nb =
        (lum(d, (y * W + (x - step)) * 4) +
          lum(d, (y * W + (x + step)) * 4) +
          lum(d, ((y - step) * W + x) * 4) +
          lum(d, ((y + step) * W + x) * 4)) / 4;
      acc += Math.abs(c - nb);
      n++;
    }
  }
  return n ? acc / n : 0;
}

const mid = (a: Pt, b: Pt): Pt => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];

export function analyzeSkinDetail(
  data: Uint8ClampedArray,
  W: number,
  H: number,
  anchors: {
    chin: Pt; forehead: Pt; leftCheek: Pt; rightCheek: Pt; noseTip: Pt; leftEye: Pt; rightEye: Pt;
  },
  isSkinTone: (r: number, g: number, b: number) => boolean,
  ctx: { sharpness: number; faceAreaPct: number }
): SkinDetail {
  const { forehead, chin, leftCheek, rightCheek, noseTip, leftEye, rightEye } = anchors;
  const faceH = Math.max(0.04, Math.abs(chin[1] - forehead[1]));
  const faceW = Math.max(0.04, Math.abs(rightCheek[0] - leftCheek[0]));
  const rx = faceW * 0.11; // region half-width
  const ry = faceH * 0.07; // region half-height

  const box = (c: Pt): Box => ({ x0: c[0] - rx, y0: c[1] - ry, x1: c[0] + rx, y1: c[1] + ry });

  // Cheek centres: pull inward from the contour so we sit on skin, not the edge.
  const lc: Pt = [leftCheek[0] + faceW * 0.10, mid(leftEye, chin)[1]];
  const rc: Pt = [rightCheek[0] - faceW * 0.10, mid(rightEye, chin)[1]];
  // Under-eye: just below each eye.
  const lu: Pt = [leftEye[0], leftEye[1] + faceH * 0.07];
  const ru: Pt = [rightEye[0], rightEye[1] + faceH * 0.07];
  // T-zone: mid-forehead + nose bridge/tip.
  const fh: Pt = [(leftEye[0] + rightEye[0]) / 2, forehead[1] + faceH * 0.10];
  const nz: Pt = [noseTip[0], noseTip[1] - faceH * 0.04];

  const skin = isSkinTone;
  const L = sampleRect(data, W, H, box(lc), skin);
  const R = sampleRect(data, W, H, box(rc), skin);
  const LU = sampleRect(data, W, H, box(lu), skin);
  const RU = sampleRect(data, W, H, box(ru), skin);
  const FH = sampleRect(data, W, H, box(fh), skin);
  const NZ = sampleRect(data, W, H, box(nz), skin);

  const cheeks = [L, R].filter(Boolean) as NonNullable<typeof L>[];
  const lowConfidence =
    cheeks.length === 0 || ctx.faceAreaPct < 4 || ctx.sharpness < 25;

  if (cheeks.length === 0) {
    return {
      clarity: 50, evenness: 50, shine: 50, underEye: 50, texture: 50,
      notes: ["Couldn't read your skin clearly in this shot — try a closer, well-lit photo."],
      topFix: "Take a closer, front-facing photo in soft daylight for a proper skin read.",
      lowConfidence: true,
    };
  }

  const cheekMean = cheeks.reduce((s, c) => s + c.mean, 0) / cheeks.length;
  const cheekSd = cheeks.reduce((s, c) => s + c.sd, 0) / cheeks.length;

  // Evenness: low within-patch spread AND low left/right difference.
  const lrDiff = cheeks.length === 2 ? Math.abs(cheeks[0].mean - cheeks[1].mean) : 0;
  const evenness = clamp(100 - cheekSd * 2.1 - lrDiff * 0.9);

  // Texture / blemish-ish local variation on the cheeks.
  const varL = localVariation(data, W, H, box(lc));
  const varR = localVariation(data, W, H, box(rc));
  const rawVar = (varL + varR) / 2;
  const texture = clamp(100 - rawVar * 7.5);

  // Shine: T-zone brighter than cheeks + bright highlight pixels.
  const tz = [FH, NZ].filter(Boolean) as NonNullable<typeof FH>[];
  const tzMean = tz.length ? tz.reduce((s, t) => s + t.mean, 0) / tz.length : cheekMean;
  const shine = clamp(((tzMean - cheekMean) / 40) * 100 * 0.8 + (tzMean > 210 ? 25 : 0));

  // Under-eye: darker than cheek = shadow/circles.
  const ue = [LU, RU].filter(Boolean) as NonNullable<typeof LU>[];
  const ueMean = ue.length ? ue.reduce((s, u) => s + u.mean, 0) / ue.length : cheekMean;
  const underEye = clamp(((cheekMean - ueMean) / 34) * 100);

  const clarity = clamp(evenness * 0.45 + texture * 0.35 + (100 - underEye) * 0.1 + (100 - Math.abs(shine - 25)) * 0.1);

  // ── Honest, specific notes ──
  const notes: string[] = [];
  if (evenness >= 72) notes.push(`Skin tone reads even across both cheeks (${Math.round(evenness)}/100).`);
  else if (evenness >= 50) notes.push(`Slightly uneven tone between areas of your face (${Math.round(evenness)}/100) — softer, more even light helps a lot.`);
  else notes.push(`Your skin tone reads patchy in this shot (${Math.round(evenness)}/100) — often the lighting, not your skin.`);

  if (texture < 55) notes.push("Some visible unevenness in skin texture — soft daylight flattens it instantly.");
  if (shine >= 55) notes.push(`Noticeable shine on your T-zone (${Math.round(shine)}/100) — a quick blot before photos kills the glare.`);
  else if (shine <= 12) notes.push("Very matte — a touch of natural light would add healthy dimension.");
  if (underEye >= 55) notes.push(`Under-eye area reads ${Math.round(underEye)}% darker than your cheeks — usually shadow from overhead light.`);

  // ── Top fix, ordered by impact ──
  let topFix: string;
  if (underEye >= 55) topFix = "Shoot facing a window instead of under a ceiling light — that alone lifts the shadows under your eyes.";
  else if (shine >= 55) topFix = "Blot your T-zone (or a light mattifier) before the shot — the glare is what's reading as oily.";
  else if (evenness < 55) topFix = "Move to soft, indirect daylight — harsh light exaggerates unevenness far more than your skin does.";
  else if (texture < 55) topFix = "Soft, diffused light (window, not direct sun) smooths texture without any editing.";
  else topFix = "Your skin reads well — keep using soft natural light and you're set.";

  if (lowConfidence) notes.push("Note: this photo is a little soft/small for a precise skin read — treat these as rough.");

  return {
    clarity: Math.round(clarity),
    evenness: Math.round(evenness),
    shine: Math.round(shine),
    underEye: Math.round(underEye),
    texture: Math.round(texture),
    notes,
    topFix,
    lowConfidence,
  };
}
