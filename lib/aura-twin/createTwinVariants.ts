import type { AuraTwinVariantType, AuraTwinVariant } from "@/types/auraTwin";
import { TWIN_VARIANT_META } from "@/types/auraTwin";
import { extractImageMetrics } from "@/lib/aura-engine/imageMetrics";
import { computeAuraScore } from "@/lib/aura-engine/scoring";
import type { ImageMetrics } from "@/types";

function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = dataUrl;
  });
}

function getCanvasContext(w: number, h: number): CanvasRenderingContext2D {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas context unavailable");
  return ctx;
}

function canvasToDataUrl(ctx: CanvasRenderingContext2D): string {
  return ctx.canvas.toDataURL("image/jpeg", 0.85);
}

function applyBrightness(ctx: CanvasRenderingContext2D, amount: number): void {
  const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
  const d = imageData.data;
  for (let i = 0; i < d.length; i += 4) {
    d[i] = Math.min(255, Math.max(0, d[i] + amount));
    d[i + 1] = Math.min(255, Math.max(0, d[i + 1] + amount));
    d[i + 2] = Math.min(255, Math.max(0, d[i + 2] + amount));
  }
  ctx.putImageData(imageData, 0, 0);
}

function applyContrast(ctx: CanvasRenderingContext2D, factor: number): void {
  const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
  const d = imageData.data;
  const f = (259 * (factor + 255)) / (255 * (259 - factor));
  for (let i = 0; i < d.length; i += 4) {
    d[i] = Math.min(255, Math.max(0, f * (d[i] - 128) + 128));
    d[i + 1] = Math.min(255, Math.max(0, f * (d[i + 1] - 128) + 128));
    d[i + 2] = Math.min(255, Math.max(0, f * (d[i + 2] - 128) + 128));
  }
  ctx.putImageData(imageData, 0, 0);
}

function applySaturation(ctx: CanvasRenderingContext2D, amount: number): void {
  const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
  const d = imageData.data;
  for (let i = 0; i < d.length; i += 4) {
    const r = d[i];
    const g = d[i + 1];
    const b = d[i + 2];
    const gray = 0.299 * r + 0.587 * g + 0.114 * b;
    d[i] = Math.min(255, Math.max(0, gray + amount * (r - gray)));
    d[i + 1] = Math.min(255, Math.max(0, gray + amount * (g - gray)));
    d[i + 2] = Math.min(255, Math.max(0, gray + amount * (b - gray)));
  }
  ctx.putImageData(imageData, 0, 0);
}

function applyVignette(ctx: CanvasRenderingContext2D, intensity: number): void {
  const { width, height } = ctx.canvas;
  const cx = width / 2;
  const cy = height / 2;
  const maxDist = Math.sqrt(cx * cx + cy * cy);
  const imageData = ctx.getImageData(0, 0, width, height);
  const d = imageData.data;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
      const vignette = 1 - intensity * Math.min(1, dist / maxDist);
      const idx = (y * width + x) * 4;
      d[idx] = Math.round(d[idx] * vignette);
      d[idx + 1] = Math.round(d[idx + 1] * vignette);
      d[idx + 2] = Math.round(d[idx + 2] * vignette);
    }
  }
  ctx.putImageData(imageData, 0, 0);
}

function applyWarmth(ctx: CanvasRenderingContext2D, amount: number): void {
  const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
  const d = imageData.data;
  for (let i = 0; i < d.length; i += 4) {
    d[i] = Math.min(255, d[i] + amount);
    d[i + 1] = Math.min(255, d[i + 1] + amount * 0.4);
    d[i + 2] = Math.max(0, d[i + 2] - amount * 0.3);
  }
  ctx.putImageData(imageData, 0, 0);
}

function applySharpness(ctx: CanvasRenderingContext2D, amount: number): void {
  if (amount <= 0) return;
  const { width, height } = ctx.canvas;
  const imageData = ctx.getImageData(0, 0, width, height);
  const src = new Uint8ClampedArray(imageData.data);
  const d = imageData.data;
  const kernel = [0, -1, 0, -1, 5, -1, 0, -1, 0];
  const kSum = 1;
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      for (let c = 0; c < 3; c++) {
        let val = 0;
        val += src[((y - 1) * width + (x - 1)) * 4 + c] * kernel[0];
        val += src[((y - 1) * width + x) * 4 + c] * kernel[1];
        val += src[((y - 1) * width + (x + 1)) * 4 + c] * kernel[2];
        val += src[(y * width + (x - 1)) * 4 + c] * kernel[3];
        val += src[(y * width + x) * 4 + c] * kernel[4];
        val += src[(y * width + (x + 1)) * 4 + c] * kernel[5];
        val += src[((y + 1) * width + (x - 1)) * 4 + c] * kernel[6];
        val += src[((y + 1) * width + x) * 4 + c] * kernel[7];
        val += src[((y + 1) * width + (x + 1)) * 4 + c] * kernel[8];
        val = Math.round(val / kSum);
        const idx = (y * width + x) * 4 + c;
        d[idx] = d[idx] + amount * (val - d[idx]);
        d[idx] = Math.min(255, Math.max(0, d[idx]));
      }
    }
  }
  ctx.putImageData(imageData, 0, 0);
}

function applyDesaturate(ctx: CanvasRenderingContext2D, amount: number): void {
  const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
  const d = imageData.data;
  for (let i = 0; i < d.length; i += 4) {
    const gray = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
    d[i] = d[i] + amount * (gray - d[i]);
    d[i + 1] = d[i + 1] + amount * (gray - d[i + 1]);
    d[i + 2] = d[i + 2] + amount * (gray - d[i + 2]);
  }
  ctx.putImageData(imageData, 0, 0);
}

function applyClarityBoost(ctx: CanvasRenderingContext2D, amount: number): void {
  applySharpness(ctx, amount);
  applyContrast(ctx, amount * 0.5);
}

function createCropVariant(originalImage: HTMLImageElement): { ctx: CanvasRenderingContext2D; variantType: AuraTwinVariantType } {
  const { width, height } = originalImage;
  const aspectRatio = width / height;

  let cropW: number, cropH: number, offsetX: number, offsetY: number;

  if (aspectRatio > 1.5) {
    cropH = height;
    cropW = Math.round(height * 0.8);
    offsetX = Math.round((width - cropW) / 2);
    offsetY = 0;
  } else if (aspectRatio < 0.67) {
    cropW = width;
    cropH = Math.round(width * 1.25);
    offsetX = 0;
    offsetY = Math.round((height - cropH) / 2);
  } else {
    const targetRatio = aspectRatio > 1 ? 1 : 0.8;
    if (aspectRatio > 1) {
      cropH = height;
      cropW = Math.round(height * targetRatio);
      offsetX = Math.round((width - cropW) / 2);
      offsetY = 0;
    } else {
      cropW = width;
      cropH = Math.round(width / targetRatio);
      offsetX = 0;
      offsetY = Math.round((height - cropH) / 2);
    }
  }

  const ctx = getCanvasContext(cropW, cropH);
  ctx.drawImage(originalImage, offsetX, offsetY, cropW, cropH, 0, 0, cropW, cropH);

  return { ctx, variantType: "cleaner_crop" };
}

export async function createTwinVariants(imageDataUrl: string): Promise<AuraTwinVariant[]> {
  const img = await loadImage(imageDataUrl);
  const { width, height } = img;
  const variants: AuraTwinVariant[] = [];

  // 1. Original
  (() => {
    const ctx = getCanvasContext(width, height);
    ctx.drawImage(img, 0, 0);
    const dataUrl = canvasToDataUrl(ctx);
    const meta = TWIN_VARIANT_META.original;
    variants.push({
      id: "original",
      type: "original",
      title: meta.title,
      description: meta.description,
      imageDataUrl: dataUrl,
      score: 0,
      scoreDelta: 0,
      metrics: {} as ImageMetrics,
      improvementReason: "This is your original image without any changes.",
      freeFix: "Use this as your baseline.",
      estimatedCost: meta.estimatedCost,
    });
  })();

  // 2. Brighter Lighting
  (() => {
    const ctx = getCanvasContext(width, height);
    ctx.drawImage(img, 0, 0);
    applyBrightness(ctx, 28);
    applyContrast(ctx, 8);
    const dataUrl = canvasToDataUrl(ctx);
    const meta = TWIN_VARIANT_META.brighter_lighting;
    variants.push({
      id: "brighter_lighting",
      type: "brighter_lighting",
      title: meta.title,
      description: meta.description,
      imageDataUrl: dataUrl,
      score: 0,
      scoreDelta: 0,
      metrics: {} as ImageMetrics,
      improvementReason: "",
      freeFix: "Face a window or use natural daylight. Avoid harsh overhead lights.",
      paidFix: "Ring light (₹300–₹800) gives consistent fill light.",
      estimatedCost: meta.estimatedCost,
    });
  })();

  // 3. Cleaner Crop
  (() => {
    const { ctx } = createCropVariant(img);
    const dataUrl = canvasToDataUrl(ctx);
    const meta = TWIN_VARIANT_META.cleaner_crop;
    variants.push({
      id: "cleaner_crop",
      type: "cleaner_crop",
      title: meta.title,
      description: meta.description,
      imageDataUrl: dataUrl,
      score: 0,
      scoreDelta: 0,
      metrics: {} as ImageMetrics,
      improvementReason: "",
      freeFix: "Center yourself in the frame. Use your phone\u2019s grid lines.",
      paidFix: "Phone tripod (₹300–₹600) helps with consistent framing.",
      estimatedCost: meta.estimatedCost,
    });
  })();

  // 4. Background Focus (vignette)
  (() => {
    const ctx = getCanvasContext(width, height);
    ctx.drawImage(img, 0, 0);
    applyVignette(ctx, 0.35);
    applyContrast(ctx, 5);
    const dataUrl = canvasToDataUrl(ctx);
    const meta = TWIN_VARIANT_META.background_focus;
    variants.push({
      id: "background_focus",
      type: "background_focus",
      title: meta.title,
      description: meta.description,
      imageDataUrl: dataUrl,
      score: 0,
      scoreDelta: 0,
      metrics: {} as ImageMetrics,
      improvementReason: "",
      freeFix: "Move to a plain wall or declutter the area behind you.",
      paidFix: "Simple backdrop cloth (₹200–₹500) or a clean bedsheet works.",
      estimatedCost: meta.estimatedCost,
    });
  })();

  // 5. Contrast Balance
  (() => {
    const ctx = getCanvasContext(width, height);
    ctx.drawImage(img, 0, 0);
    applyContrast(ctx, 15);
    const existingSaturation = 0;
    if (existingSaturation > 70) {
      applySaturation(ctx, 0.85);
    } else if (existingSaturation < 30) {
      applySaturation(ctx, 1.3);
    }
    const dataUrl = canvasToDataUrl(ctx);
    const meta = TWIN_VARIANT_META.contrast_balance;
    variants.push({
      id: "contrast_balance",
      type: "contrast_balance",
      title: meta.title,
      description: meta.description,
      imageDataUrl: dataUrl,
      score: 0,
      scoreDelta: 0,
      metrics: {} as ImageMetrics,
      improvementReason: "",
      freeFix: "Adjust your phone camera settings. Use natural, angled light.",
      estimatedCost: meta.estimatedCost,
    });
  })();

  // 6. Premium Minimal
  (() => {
    const ctx = getCanvasContext(width, height);
    ctx.drawImage(img, 0, 0);
    applyDesaturate(ctx, 0.35);
    applyContrast(ctx, 12);
    applyBrightness(ctx, -8);
    const dataUrl = canvasToDataUrl(ctx);
    const meta = TWIN_VARIANT_META.premium_minimal;
    variants.push({
      id: "premium_minimal",
      type: "premium_minimal",
      title: meta.title,
      description: meta.description,
      imageDataUrl: dataUrl,
      score: 0,
      scoreDelta: 0,
      metrics: {} as ImageMetrics,
      improvementReason: "",
      freeFix: "Use neutral clothing and a clean, simple background.",
      paidFix: "Neutral solid shirt (₹500–₹1,500) and minimal backdrop.",
      estimatedCost: meta.estimatedCost,
      caution: "Avoid if your environment is already very dark or low-contrast.",
    });
  })();

  // 7. Creator Bold
  (() => {
    const ctx = getCanvasContext(width, height);
    ctx.drawImage(img, 0, 0);
    applyClarityBoost(ctx, 0.25);
    applySaturation(ctx, 1.15);
    applyBrightness(ctx, 5);
    const dataUrl = canvasToDataUrl(ctx);
    const meta = TWIN_VARIANT_META.creator_bold;
    variants.push({
      id: "creator_bold",
      type: "creator_bold",
      title: meta.title,
      description: meta.description,
      imageDataUrl: dataUrl,
      score: 0,
      scoreDelta: 0,
      metrics: {} as ImageMetrics,
      improvementReason: "",
      freeFix: "Shoot in good natural light with a clean, colorful background.",
      paidFix: "Ring light + phone tripod (₹800–₹1,500 total).",
      estimatedCost: meta.estimatedCost,
      caution: "Over-editing can look artificial. Keep it natural.",
    });
  })();

  // 8. Professional Clean
  (() => {
    const ctx = getCanvasContext(width, height);
    ctx.drawImage(img, 0, 0);
    applyBrightness(ctx, 12);
    applyContrast(ctx, 10);
    applyDesaturate(ctx, 0.15);
    const dataUrl = canvasToDataUrl(ctx);
    const meta = TWIN_VARIANT_META.professional_clean;
    variants.push({
      id: "professional_clean",
      type: "professional_clean",
      title: meta.title,
      description: meta.description,
      imageDataUrl: dataUrl,
      score: 0,
      scoreDelta: 0,
      metrics: {} as ImageMetrics,
      improvementReason: "",
      freeFix: "Wear clean, ironed clothing. Use even, natural lighting.",
      paidFix: "Clean formal shirt + table lamp for fill light (₹500–₹2,000).",
      estimatedCost: meta.estimatedCost,
    });
  })();

  // 9. Warm Dating
  (() => {
    const ctx = getCanvasContext(width, height);
    ctx.drawImage(img, 0, 0);
    applyWarmth(ctx, 12);
    applyContrast(ctx, -5);
    applyBrightness(ctx, 5);
    const dataUrl = canvasToDataUrl(ctx);
    const meta = TWIN_VARIANT_META.warm_dating;
    variants.push({
      id: "warm_dating",
      type: "warm_dating",
      title: meta.title,
      description: meta.description,
      imageDataUrl: dataUrl,
      score: 0,
      scoreDelta: 0,
      metrics: {} as ImageMetrics,
      improvementReason: "",
      freeFix: "Shoot during golden hour or near a warm lamp. Smile naturally.",
      paidFix: "Warm-toned lamp (₹500–₹1,500) for soft, inviting light.",
      estimatedCost: meta.estimatedCost,
      caution: "Avoid making the image look orange or over-filtered.",
    });
  })();

  // Score all variants
  await Promise.all(
    variants.map(async (variant) => {
      const metrics = await extractImageMetrics(variant.imageDataUrl);
      const score = computeAuraScore(metrics);
      variant.metrics = metrics;
      variant.score = score;
    })
  );

  const originalScore = variants[0].score;
  for (const variant of variants) {
    variant.scoreDelta = variant.score - originalScore;
  }

  // Fill in improvement reasons based on metrics
  for (const variant of variants) {
    if (variant.type === "original") continue;
    const og = variants[0].metrics;
    const vm = variant.metrics;
    const reasons: string[] = [];

    if (vm.lightingScore > og.lightingScore + 3) reasons.push("better lighting signal");
    if (vm.clarityScore > og.clarityScore + 3) reasons.push("improved clarity");
    if (vm.compositionScore > og.compositionScore + 3) reasons.push("stronger composition");
    if (vm.overallImageQualityScore > og.overallImageQualityScore + 2) reasons.push("higher overall quality");
    if (vm.backgroundComplexityEstimate < og.backgroundComplexityEstimate - 5) reasons.push("cleaner background perception");

    if (reasons.length === 0) {
      variant.improvementReason = "Minor visual refinement with marginal score change.";
    } else {
      variant.improvementReason = "This version shows " + reasons.join(", ") + ".";
    }
  }

  return variants;
}
