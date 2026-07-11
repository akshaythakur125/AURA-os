// ponytail: canvas-based image transformations — local, deterministic, no dependencies

export type TransformParams = {
  exposure?: number; // -1 to 1
  contrast?: number; // -1 to 1
  brightness?: number; // -1 to 1
  saturation?: number; // -1 to 1
  blur?: number; // 0 to 20
  cropX?: number; // 0 to 1
  cropY?: number;
  cropW?: number;
  cropH?: number;
  bgBlur?: boolean; // background blur approximation
  colorOverlay?: string; // hex color with alpha
  vignette?: boolean;
};

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

/** Apply all transforms to an image, return a new data URL */
export function applyTransform(
  img: HTMLImageElement,
  params: TransformParams,
  maxWidth = 800,
  maxH = 800
): string {
  let w = img.naturalWidth;
  let h = img.naturalHeight;
  if (w > maxWidth) { h = (h / w) * maxWidth; w = maxWidth; }
  if (h > maxH) { w = (w / h) * maxH; h = maxH; }

  // Apply crop
  const cx = (params.cropX ?? 0) * img.naturalWidth;
  const cy = (params.cropY ?? 0) * img.naturalHeight;
  const cw = (params.cropW ?? 1) * img.naturalWidth;
  const ch = (params.cropH ?? 1) * img.naturalHeight;

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, cx, cy, cw, ch, 0, 0, w, h);

  // Pixel manipulation
  const imageData = ctx.getImageData(0, 0, w, h);
  const d = imageData.data;
  const exp = params.exposure ?? 0;
  const con = params.contrast ?? 0;
  const bri = params.brightness ?? 0;
  const sat = params.saturation ?? 0;

  const contrastFactor = con !== 0 ? (259 * (con * 255 + 255)) / (255 * (259 - con * 255)) : 1;
  const exposureMult = Math.pow(2, exp * 2);

  for (let i = 0; i < d.length; i += 4) {
    let r = d[i], g = d[i + 1], b = d[i + 2];

    // Exposure
    r *= exposureMult;
    g *= exposureMult;
    b *= exposureMult;

    // Brightness
    const bAdd = bri * 100;
    r += bAdd;
    g += bAdd;
    b += bAdd;

    // Contrast
    if (con !== 0) {
      r = contrastFactor * (r - 128) + 128;
      g = contrastFactor * (g - 128) + 128;
      b = contrastFactor * (b - 128) + 128;
    }

    // Saturation
    if (sat !== 0) {
      const gray = 0.2989 * r + 0.587 * g + 0.114 * b;
      const s = 1 + sat;
      r = gray + s * (r - gray);
      g = gray + s * (g - gray);
      b = gray + s * (b - gray);
    }

    d[i] = clamp(r, 0, 255);
    d[i + 1] = clamp(g, 0, 255);
    d[i + 2] = clamp(b, 0, 255);
  }

  ctx.putImageData(imageData, 0, 0);

  // Vignette
  if (params.vignette) {
    const gradient = ctx.createRadialGradient(w / 2, h / 2, w * 0.2, w / 2, h / 2, w * 0.7);
    gradient.addColorStop(0, "rgba(0,0,0,0)");
    gradient.addColorStop(1, "rgba(0,0,0,0.4)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);
  }

  // Background blur approximation — blur edges (simulated with multiple passes)
  if (params.bgBlur) {
    ctx.filter = "blur(8px)";
    ctx.globalAlpha = 0.3;
    ctx.drawImage(canvas, 0, 0, w, h);
    ctx.filter = "none";
    ctx.globalAlpha = 1;
  }

  // Color overlay
  if (params.colorOverlay) {
    ctx.globalCompositeOperation = "overlay";
    ctx.globalAlpha = 0.15;
    ctx.fillStyle = params.colorOverlay;
    ctx.fillRect(0, 0, w, h);
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1;
  }

  return canvas.toDataURL("image/jpeg", 0.85);
}

/** Preset transformations mapped to audit findings */
export const TRANSFORM_PRESETS = [
  {
    id: "brighter",
    label: "Brighter",
    category: "lighting",
    description: "Increase exposure to simulate better lighting",
    params: { exposure: 0.3, brightness: 0.1 } as TransformParams,
    confidence: "high" as const,
    finding: "Image is underexposed",
    action: "Face a window at 45° for natural side light",
  },
  {
    id: "softer-light",
    label: "Softer Light",
    category: "lighting",
    description: "Reduce harsh shadows and balance lighting",
    params: { exposure: 0.15, contrast: -0.1, brightness: 0.05 } as TransformParams,
    confidence: "moderate" as const,
    finding: "Harsh or uneven lighting",
    action: "Use diffused light — a white curtain or lamp shade works",
  },
  {
    id: "clean-crop",
    label: "Clean Crop",
    category: "crop",
    description: "Crop to head-and-shoulders for a focused portrait",
    params: { cropX: 0.15, cropY: 0.05, cropW: 0.7, cropH: 0.6 } as TransformParams,
    confidence: "high" as const,
    finding: "Too much empty space around subject",
    action: "Centre yourself with eyes at the upper-third line",
  },
  {
    id: "bg-darken",
    label: "Darken Background",
    category: "background",
    description: "Darken background to improve subject separation",
    params: { brightness: 0.1, vignette: true } as TransformParams,
    confidence: "moderate" as const,
    finding: "Background competes with subject",
    action: "Stand against a darker wall or increase distance from background",
  },
  {
    id: "warm-tone",
    label: "Warm Tone",
    category: "colour",
    description: "Add warmth for a more inviting presentation",
    params: { colorOverlay: "#FFD700", saturation: 0.1 } as TransformParams,
    confidence: "moderate" as const,
    finding: "Image feels cold or uninviting",
    action: "Shoot near warm indoor lighting or during golden hour",
  },
  {
    id: "cool-tone",
    label: "Cool Tone",
    category: "colour",
    description: "Cooler tones for a professional look",
    params: { colorOverlay: "#4A90D9", saturation: -0.05 } as TransformParams,
    confidence: "moderate" as const,
    finding: "Image feels too warm for professional context",
    action: "Use neutral white balance or cooler indoor lighting",
  },
  {
    id: "vignette",
    label: "Vignette",
    category: "framing",
    description: "Subtle vignette draws focus to the subject",
    params: { vignette: true } as TransformParams,
    confidence: "high" as const,
    finding: "Eye direction not guided to subject",
    action: "The vignette guides attention to the center — your subject",
  },
  {
    id: "studio-look",
    label: "Studio Look",
    category: "presentation",
    description: "Combined adjustments for a polished studio feel",
    params: { exposure: 0.1, contrast: 0.1, saturation: -0.05, vignette: true } as TransformParams,
    confidence: "moderate" as const,
    finding: "Image lacks professional polish",
    action: "Even lighting + clean background + muted colors = studio feel",
  },
];
