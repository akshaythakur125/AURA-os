import type { AuraTwinVariant } from "@/types/auraTwin";
import { TWIN_VARIANT_META } from "@/types/auraTwin";
import { extractImageMetrics } from "@/lib/aura-engine/imageMetrics";
import { computeAuraScore } from "@/lib/aura-engine/scoring";
import type { ImageMetrics } from "@/types";

type ProgressFn = (done: number, total: number, label: string) => void;

function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = dataUrl;
  });
}

function createCanvas(w: number, h: number): [CanvasRenderingContext2D, HTMLCanvasElement] {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas context unavailable");
  return [ctx, canvas];
}

function toJpeg(canvas: HTMLCanvasElement): string {
  return canvas.toDataURL("image/jpeg", 0.85);
}

function imageDataFrom(ctx: CanvasRenderingContext2D): ImageData {
  return ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
}

/* ─── pixel filters ─── */

function clampByte(v: number): number {
  return Math.min(255, Math.max(0, v));
}

function applyBrightness(d: Uint8ClampedArray, amount: number): void {
  for (let i = 0; i < d.length; i += 4) {
    d[i] = clampByte(d[i] + amount);
    d[i + 1] = clampByte(d[i + 1] + amount);
    d[i + 2] = clampByte(d[i + 2] + amount);
  }
}

function applyContrast(d: Uint8ClampedArray, factor: number): void {
  const f = (259 * (factor + 255)) / (255 * (259 - factor));
  for (let i = 0; i < d.length; i += 4) {
    d[i] = clampByte(f * (d[i] - 128) + 128);
    d[i + 1] = clampByte(f * (d[i + 1] - 128) + 128);
    d[i + 2] = clampByte(f * (d[i + 2] - 128) + 128);
  }
}

function applySaturation(d: Uint8ClampedArray, amount: number): void {
  for (let i = 0; i < d.length; i += 4) {
    const gray = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
    d[i] = clampByte(gray + amount * (d[i] - gray));
    d[i + 1] = clampByte(gray + amount * (d[i + 1] - gray));
    d[i + 2] = clampByte(gray + amount * (d[i + 2] - gray));
  }
}

function applyVignette(d: Uint8ClampedArray, w: number, h: number, intensity: number, feather: number = 0.3): void {
  const cx = w / 2;
  const cy = h / 2;
  const maxDist = Math.sqrt(cx * cx + cy * cy);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
      const raw = Math.min(1, dist / maxDist);
      const vignette = 1 - intensity * (raw < feather ? raw / feather * raw : raw);
      const idx = (y * w + x) * 4;
      d[idx] = Math.round(d[idx] * vignette);
      d[idx + 1] = Math.round(d[idx + 1] * vignette);
      d[idx + 2] = Math.round(d[idx + 2] * vignette);
    }
  }
}

function applyWarmth(d: Uint8ClampedArray, amount: number): void {
  for (let i = 0; i < d.length; i += 4) {
    d[i] = clampByte(d[i] + amount);
    d[i + 1] = clampByte(d[i + 1] + amount * 0.55);
    d[i + 2] = clampByte(d[i + 2] - amount * 0.35);
  }
}

function applyClarity(d: Uint8ClampedArray, w: number, h: number, amount: number): void {
  if (amount <= 0) return;
  const src = new Uint8ClampedArray(d);
  const kernelWeight = 5 + amount * 1.2;
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      for (let c = 0; c < 3; c++) {
        const idx = (y * w + x) * 4 + c;
        const center = src[idx];
        const n = src[((y - 1) * w + x) * 4 + c];
        const s = src[((y + 1) * w + x) * 4 + c];
        const e = src[(y * w + (x + 1)) * 4 + c];
        const ww = src[(y * w + (x - 1)) * 4 + c];
        const avg = (n + s + e + ww) / 4;
        const sharp = center * kernelWeight - avg * (kernelWeight - 1);
        d[idx] = clampByte(center + amount * 0.3 * (sharp - center));
      }
    }
  }
}

function applyDesaturate(d: Uint8ClampedArray, amount: number): void {
  for (let i = 0; i < d.length; i += 4) {
    const gray = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
    d[i] = d[i] + amount * (gray - d[i]);
    d[i + 1] = d[i + 1] + amount * (gray - d[i + 1]);
    d[i + 2] = d[i + 2] + amount * (gray - d[i + 2]);
  }
}

function applyCoolTone(d: Uint8ClampedArray, amount: number): void {
  for (let i = 0; i < d.length; i += 4) {
    d[i] = clampByte(d[i] - amount * 0.3);
    d[i + 1] = clampByte(d[i + 1] - amount * 0.1);
    d[i + 2] = clampByte(d[i + 2] + amount * 0.25);
  }
}

/* ─── pipeline helpers ─── */

function processPixels(
  ctx: CanvasRenderingContext2D,
  fn: (d: Uint8ClampedArray, w: number, h: number) => void
): void {
  const { width: w, height: h } = ctx.canvas;
  const id = imageDataFrom(ctx);
  fn(id.data, w, h);
  ctx.putImageData(id, 0, 0);
}

function variantContext(img: HTMLImageElement, w: number, h: number): CanvasRenderingContext2D {
  const [ctx] = createCanvas(w, h);
  ctx.drawImage(img, 0, 0);
  return ctx;
}

function ctxToJpeg(ctx: CanvasRenderingContext2D): string {
  return toJpeg(ctx.canvas);
}

/* ─── crop logic ─── */

function computeCrop(w: number, h: number): { cw: number; ch: number; ox: number; oy: number } {
  const ar = w / h;

  if (ar > 1.5) {
    return { cw: Math.round(h * 0.85), ch: h, ox: Math.round(w * 0.075), oy: 0 };
  }
  if (ar < 0.67) {
    return { cw: w, ch: Math.round(w * 1.2), ox: 0, oy: Math.round(h * 0.1) };
  }
  if (ar > 1) {
    return { cw: Math.round(h), ch: h, ox: Math.round((w - h) * 0.45), oy: 0 };
  }
  return { cw: w, ch: Math.round(w / 0.8), ox: 0, oy: Math.round((h - w / 0.8) * 0.55) };
}

/* ─── main ─── */

export async function createTwinVariants(
  imageDataUrl: string,
  onProgress?: ProgressFn
): Promise<AuraTwinVariant[]> {
  const img = await loadImage(imageDataUrl);
  const { width: w, height: h } = img;

  // ── score original first to adapt adjustments ──
  const [origCtx] = createCanvas(w, h);
  origCtx.drawImage(img, 0, 0);
  const origDataUrl = toJpeg(origCtx.canvas);
  const origMetrics = await extractImageMetrics(origDataUrl);
  const origScore = computeAuraScore(origMetrics);

  onProgress?.(0, 10, "Scored original");

  const variants: AuraTwinVariant[] = [];

  const meta = (t: AuraTwinVariant["type"]) => TWIN_VARIANT_META[t];

  // ── adapted adjustment strengths ──
  const brightBoost = origMetrics.brightness < 45 ? 32 : origMetrics.brightness < 60 ? 22 : 14;
  const contrastBoost = origMetrics.contrast < 35 ? 18 : origMetrics.contrast < 50 ? 14 : 9;
  const saturationTame = origMetrics.saturation > 70 ? 0.82 : origMetrics.saturation > 55 ? 0.92 : 1.05;

  /* 1 ─ original */
  variants.push({
    id: "original", type: "original",
    title: meta("original").title, emoji: meta("original").emoji,
    description: meta("original").description,
    imageDataUrl: origDataUrl, score: origScore, scoreDelta: 0,
    metrics: origMetrics,
    improvementReason: "This is your original image without any changes.",
    freeFix: "Use this as your baseline.",
    estimatedCost: meta("original").estimatedCost,
    isFree: meta("original").isFree,
  });

  onProgress?.(1, 10, "Original");

  /* 2 ─ brighter_lighting */
  (() => {
    const ctx = variantContext(img, w, h);
    processPixels(ctx, (d) => { applyBrightness(d, brightBoost); applyContrast(d, contrastBoost * 0.5); });
    const dataUrl = ctxToJpeg(ctx);
    variants.push({
      id: "brighter_lighting", type: "brighter_lighting",
      title: meta("brighter_lighting").title, emoji: meta("brighter_lighting").emoji,
      description: meta("brighter_lighting").description,
      imageDataUrl: dataUrl, score: 0, scoreDelta: 0, metrics: {} as ImageMetrics,
      improvementReason: "",
      freeFix: "Face a window or use natural daylight. Avoid harsh overhead lights.",
      paidFix: "Ring light (₹300–₹800) gives consistent, flattering fill.",
      estimatedCost: meta("brighter_lighting").estimatedCost,
      isFree: meta("brighter_lighting").isFree,
    });
  })();
  onProgress?.(2, 10, "Brighter lighting");

  /* 3 ─ cleaner_crop */
  (() => {
    const { cw, ch, ox, oy } = computeCrop(w, h);
    const [ctx] = createCanvas(cw, ch);
    ctx.drawImage(img, ox, oy, cw, ch, 0, 0, cw, ch);
    const dataUrl = toJpeg(ctx.canvas);
    variants.push({
      id: "cleaner_crop", type: "cleaner_crop",
      title: meta("cleaner_crop").title, emoji: meta("cleaner_crop").emoji,
      description: meta("cleaner_crop").description,
      imageDataUrl: dataUrl, score: 0, scoreDelta: 0, metrics: {} as ImageMetrics,
      improvementReason: "",
      freeFix: "Center yourself in the frame. Use your phone grid lines.",
      paidFix: "Phone tripod (₹300–₹600) for steady, consistent framing.",
      estimatedCost: meta("cleaner_crop").estimatedCost,
      isFree: meta("cleaner_crop").isFree,
    });
  })();
  onProgress?.(3, 10, "Cleaner crop");

  /* 4 ─ background_focus */
  (() => {
    const ctx = variantContext(img, w, h);
    processPixels(ctx, (d, cw, ch) => { applyVignette(d, cw, ch, 0.4, 0.25); applyContrast(d, 6); });
    const dataUrl = ctxToJpeg(ctx);
    variants.push({
      id: "background_focus", type: "background_focus",
      title: meta("background_focus").title, emoji: meta("background_focus").emoji,
      description: meta("background_focus").description,
      imageDataUrl: dataUrl, score: 0, scoreDelta: 0, metrics: {} as ImageMetrics,
      improvementReason: "",
      freeFix: "Move to a plain wall or declutter the area behind you.",
      paidFix: "Simple backdrop cloth (₹200–₹500) or a clean bedsheet.",
      estimatedCost: meta("background_focus").estimatedCost,
      isFree: meta("background_focus").isFree,
    });
  })();
  onProgress?.(4, 10, "Background focus");

  /* 5 ─ contrast_balance */
  (() => {
    const ctx = variantContext(img, w, h);
    processPixels(ctx, (d) => { applyContrast(d, contrastBoost); applySaturation(d, saturationTame); });
    const dataUrl = ctxToJpeg(ctx);
    variants.push({
      id: "contrast_balance", type: "contrast_balance",
      title: meta("contrast_balance").title, emoji: meta("contrast_balance").emoji,
      description: meta("contrast_balance").description,
      imageDataUrl: dataUrl, score: 0, scoreDelta: 0, metrics: {} as ImageMetrics,
      improvementReason: "",
      freeFix: "Adjust your phone camera exposure. Use natural, angled light.",
      estimatedCost: meta("contrast_balance").estimatedCost,
      isFree: meta("contrast_balance").isFree,
    });
  })();
  onProgress?.(5, 10, "Contrast balance");

  /* 6 ─ premium_minimal */
  (() => {
    const ctx = variantContext(img, w, h);
    const desatStr = origMetrics.saturation > 60 ? 0.4 : 0.25;
    processPixels(ctx, (d) => { applyDesaturate(d, desatStr); applyContrast(d, 14); applyCoolTone(d, 5); });
    const dataUrl = ctxToJpeg(ctx);
    variants.push({
      id: "premium_minimal", type: "premium_minimal",
      title: meta("premium_minimal").title, emoji: meta("premium_minimal").emoji,
      description: meta("premium_minimal").description,
      imageDataUrl: dataUrl, score: 0, scoreDelta: 0, metrics: {} as ImageMetrics,
      improvementReason: "",
      freeFix: "Wear neutral-toned clothing against a clean, simple background.",
      paidFix: "Neutral solid shirt (₹500–₹1,500) with minimal backdrop.",
      estimatedCost: meta("premium_minimal").estimatedCost,
      isFree: meta("premium_minimal").isFree,
      caution: "Skip if your room is already dark. This look needs some base light.",
    });
  })();
  onProgress?.(6, 10, "Premium minimal");

  /* 7 ─ creator_bold */
  (() => {
    const ctx = variantContext(img, w, h);
    processPixels(ctx, (d, cw, ch) => {
      applyClarity(d, cw, ch, 0.35);
      applySaturation(d, 1.2);
      applyBrightness(d, 6);
    });
    const dataUrl = ctxToJpeg(ctx);
    variants.push({
      id: "creator_bold", type: "creator_bold",
      title: meta("creator_bold").title, emoji: meta("creator_bold").emoji,
      description: meta("creator_bold").description,
      imageDataUrl: dataUrl, score: 0, scoreDelta: 0, metrics: {} as ImageMetrics,
      improvementReason: "",
      freeFix: "Shoot in strong natural light with a clean, colourful background.",
      paidFix: "Ring light + phone tripod (₹800–₹1,500 total).",
      estimatedCost: meta("creator_bold").estimatedCost,
      isFree: meta("creator_bold").isFree,
      caution: "Over-processing looks artificial. Keep intensity natural.",
    });
  })();
  onProgress?.(7, 10, "Creator bold");

  /* 8 ─ professional_clean */
  (() => {
    const ctx = variantContext(img, w, h);
    const brightAdj = origMetrics.brightness < 55 ? 18 : 10;
    processPixels(ctx, (d) => { applyBrightness(d, brightAdj); applyContrast(d, 12); applyDesaturate(d, 0.18); });
    const dataUrl = ctxToJpeg(ctx);
    variants.push({
      id: "professional_clean", type: "professional_clean",
      title: meta("professional_clean").title, emoji: meta("professional_clean").emoji,
      description: meta("professional_clean").description,
      imageDataUrl: dataUrl, score: 0, scoreDelta: 0, metrics: {} as ImageMetrics,
      improvementReason: "",
      freeFix: "Wear clean, ironed clothing. Use even, natural daylight.",
      paidFix: "Clean formal shirt + table lamp fill (₹500–₹2,000).",
      estimatedCost: meta("professional_clean").estimatedCost,
      isFree: meta("professional_clean").isFree,
    });
  })();
  onProgress?.(8, 10, "Professional clean");

  /* 9 ─ warm_dating */
  (() => {
    const ctx = variantContext(img, w, h);
    processPixels(ctx, (d) => { applyWarmth(d, 14); applyContrast(d, -6); applyBrightness(d, 6); });
    const dataUrl = ctxToJpeg(ctx);
    variants.push({
      id: "warm_dating", type: "warm_dating",
      title: meta("warm_dating").title, emoji: meta("warm_dating").emoji,
      description: meta("warm_dating").description,
      imageDataUrl: dataUrl, score: 0, scoreDelta: 0, metrics: {} as ImageMetrics,
      improvementReason: "",
      freeFix: "Shoot during golden hour or near a warm lamp. Smile naturally.",
      paidFix: "Warm-toned lamp (₹500–₹1,500) for soft, inviting light.",
      estimatedCost: meta("warm_dating").estimatedCost,
      isFree: meta("warm_dating").isFree,
      caution: "Do not let the image look orange or heavily filtered.",
    });
  })();
  onProgress?.(9, 10, "Warm dating");

  // ── score all variants in parallel ──
  await Promise.all(
    variants.map(async (v) => {
      if (v.type === "original") return;
      const m = await extractImageMetrics(v.imageDataUrl);
      v.metrics = m;
      v.score = computeAuraScore(m);
    })
  );

  for (const v of variants) {
    v.scoreDelta = v.score - origScore;
  }

  // ── combined_best: smart blend of top 2 free winners ──
  const freeSorted = variants
    .filter((v) => v.type !== "original" && v.isFree && v.scoreDelta > 0)
    .sort((a, b) => b.scoreDelta - a.scoreDelta);

  if (freeSorted.length >= 2) {
    const first = freeSorted[0].type;
    const second = freeSorted[1].type;
    const ctx = variantContext(img, w, h);

    const apply = (t: AuraTwinVariant["type"]) => {
      if (t === "brighter_lighting") {
        processPixels(ctx, (d) => { applyBrightness(d, brightBoost); applyContrast(d, contrastBoost * 0.5); });
      } else if (t === "cleaner_crop") {
        // crop already changes canvas dimensions, so for combined we do vignette as a proxy
        processPixels(ctx, (d, cw, ch) => { applyVignette(d, cw, ch, 0.15, 0.5); });
      } else if (t === "background_focus") {
        processPixels(ctx, (d, cw, ch) => { applyVignette(d, cw, ch, 0.4, 0.25); applyContrast(d, 6); });
      } else if (t === "contrast_balance") {
        processPixels(ctx, (d) => { applyContrast(d, contrastBoost); applySaturation(d, saturationTame); });
      }
    };
    apply(first);
    if (first !== "cleaner_crop" || second !== "cleaner_crop") apply(second);

    const dataUrl = ctxToJpeg(ctx);
    const m = await extractImageMetrics(dataUrl);
    variants.push({
      id: "combined_best", type: "combined_best",
      title: meta("combined_best").title, emoji: meta("combined_best").emoji,
      description: meta("combined_best").description,
      imageDataUrl: dataUrl,
      score: computeAuraScore(m), scoreDelta: computeAuraScore(m) - origScore,
      metrics: m,
      improvementReason: "",
      freeFix: `Combines "${freeSorted[0].title}" + "${freeSorted[1].title}" — two free fixes that work well together.`,
      estimatedCost: meta("combined_best").estimatedCost,
      isFree: meta("combined_best").isFree,
    });
  }

  onProgress?.(10, 10, "Combined best");

  // ── fill improvement reasons ──
  for (const v of variants) {
    if (v.type === "original") continue;
    const og = origMetrics;
    const vm = v.metrics;
    const reasons: string[] = [];

    const dLight = vm.lightingScore - og.lightingScore;
    const dClarity = vm.clarityScore - og.clarityScore;
    const dComposition = vm.compositionScore - og.compositionScore;
    const dBg = og.backgroundComplexityEstimate - vm.backgroundComplexityEstimate;

    if (dLight >= 4) reasons.push(`lighting +${dLight}`);
    if (dClarity >= 4) reasons.push(`clarity +${dClarity}`);
    if (dComposition >= 4) reasons.push(`composition +${dComposition}`);
    if (dBg >= 6) reasons.push(`background clearer by ${dBg}`);

    if (reasons.length === 0) {
      v.improvementReason = "Marginal change — your baseline is already solid here.";
    } else {
      v.improvementReason = "Improves " + reasons.join(", ") + " vs the original.";
    }
  }

  return variants;
}
