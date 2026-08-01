/**
 * One-tap auto-fix — turns the SAME measured signals the edit recipe explains
 * into actual pixel corrections, so instead of learning Instagram's sliders the
 * user just gets their improved photo back. This is the "skip the editing app"
 * half of the Ready-to-Post Pack: a real, tasteful correction (never a heavy
 * filter) they can download and post in seconds.
 *
 * Pure and framework-free: planAutoFix() decides the numbers from the metrics;
 * applyPixels() runs them over a pixel buffer. Both testable without a DOM.
 */

export interface AutoFixMetrics {
  brightness: number;        // 0–100
  contrast: number;          // 0–100
  saturation: number;        // 0–100
  imageDullness: number;     // 0–100
  dominantHue: string;       // "warm" | "cool" | "greenish" | "neutral" | …
  faceBrightness: number;    // 0–100 (0 when no face)
  backgroundBrightness: number; // 0–100
  subjectCenterX?: number;   // 0–1
  subjectCenterY?: number;   // 0–1
}

export interface AutoFixPlan {
  exposure: number;   // added to each channel, ~−40..+48 (0–255 space)
  contrast: number;   // multiplier around 128, 1.0..1.35
  warmthR: number;    // added to red
  warmthB: number;    // added to blue
  saturation: number; // 0.78..1.18
  changes: string[];  // human summary of what got fixed
}

function clamp(n: number, lo: number, hi: number): number {
  return n < lo ? lo : n > hi ? hi : n;
}

export function planAutoFix(m: AutoFixMetrics): AutoFixPlan {
  const changes: string[] = [];

  // ── Exposure: lift an underexposed face, or pull back a blown-out shot. ──
  let exposure = 0;
  const face = m.faceBrightness;
  if (face > 0 && face < 50) {
    const lift = clamp((52 - face) * 2.0, 6, 46);
    exposure = lift;
    changes.push(`Brightened your underexposed face (+${Math.round(lift)})`);
  } else if (m.brightness > 76) {
    exposure = -clamp((m.brightness - 76) * 1.6, 6, 34);
    changes.push("Recovered detail in an over-bright shot");
  }

  // ── Contrast: add depth to a flat image. ──
  let contrast = 1;
  if (m.contrast < 42) {
    contrast = clamp(1 + (42 - m.contrast) / 140, 1.05, 1.32);
    changes.push("Added depth to a flat, low-contrast image");
  }

  // ── Warmth: cancel a colour cast so skin reads healthy. ──
  let warmthR = 0;
  let warmthB = 0;
  if (m.dominantHue === "cool") {
    warmthR = 12; warmthB = -10;
    changes.push("Warmed a cool/blue cast for healthier skin tone");
  } else if (m.dominantHue === "greenish") {
    warmthR = 10; warmthB = -4;
    changes.push("Cancelled a green (fluorescent) cast");
  } else if (m.dominantHue === "warm" && m.saturation > 55) {
    warmthR = -8; warmthB = 6;
    changes.push("Cooled an over-orange image back to natural");
  }

  // ── Saturation: revive dull colour, or rein in neon. ──
  let saturation = 1;
  const dull = m.imageDullness > 50 || (m.saturation < 32 && m.contrast < 35);
  if (m.saturation > 66) {
    saturation = 0.82;
    changes.push("Dialled back over-pushed colour so skin looks natural");
  } else if (dull) {
    saturation = 1.14;
    changes.push("Revived flat, dull colour");
  }

  if (changes.length === 0) changes.push("Your light and colour were already clean — applied only a whisper of polish");

  return { exposure, contrast, warmthR, warmthB, saturation, changes };
}

/** Apply the plan in place over an RGBA pixel buffer (one pass). */
export function applyPixels(data: Uint8ClampedArray, p: AutoFixPlan): void {
  const { exposure, contrast, warmthR, warmthB, saturation } = p;
  for (let i = 0; i < data.length; i += 4) {
    let r = data[i], g = data[i + 1], b = data[i + 2];

    // exposure + contrast around mid-grey
    r = (r - 128) * contrast + 128 + exposure;
    g = (g - 128) * contrast + 128 + exposure;
    b = (b - 128) * contrast + 128 + exposure;

    // white-balance / warmth
    r += warmthR; b += warmthB;

    // saturation around luma
    if (saturation !== 1) {
      const luma = 0.299 * r + 0.587 * g + 0.114 * b;
      r = luma + (r - luma) * saturation;
      g = luma + (g - luma) * saturation;
      b = luma + (b - luma) * saturation;
    }

    data[i] = clamp(r, 0, 255);
    data[i + 1] = clamp(g, 0, 255);
    data[i + 2] = clamp(b, 0, 255);
  }
}

/**
 * Given source dimensions, the subject centre, and a target aspect (w/h),
 * return the crop rectangle that recomposes the shot: subject centred
 * horizontally, face sitting on the upper third. Never exceeds the source.
 */
export function computeCrop(
  srcW: number,
  srcH: number,
  aspect: number,
  centerX = 0.5,
  centerY = 0.42,
): { sx: number; sy: number; sw: number; sh: number } {
  // Largest rect of the target aspect that fits inside the source.
  let sw = srcW;
  let sh = Math.round(sw / aspect);
  if (sh > srcH) { sh = srcH; sw = Math.round(sh * aspect); }

  // Place the subject: centre X, face at ~upper third of the crop.
  const cx = clamp(centerX, 0, 1) * srcW;
  const cy = clamp(centerY, 0, 1) * srcH;
  let sx = Math.round(cx - sw / 2);
  let sy = Math.round(cy - sh * 0.38);

  sx = clamp(sx, 0, srcW - sw);
  sy = clamp(sy, 0, srcH - sh);
  return { sx, sy, sw, sh };
}
