/**
 * Synthetic image transformations — deterministic Canvas API.
 * Used for evaluation fixtures. Never uses randomness.
 */

export type TransformationType =
  | "gaussian-blur"
  | "underexposure"
  | "overexposure"
  | "downscale"
  | "noise"
  | "warm-cast"
  | "cool-cast"
  | "reduce-saturation"
  | "add-headroom"
  | "crop" | "motion-blur" | "rotate" | "perspective" | "contrast" | "saturation" | "screenshot" | "background-clutter";

export type SyntheticTransformation = {
  id: string;
  sourceImageId: string;
  type: TransformationType;
  parameters: Record<string, number | string>;
};

/** Apply a deterministic transformation to an image data URL */
export async function applyTransformation(
  imageDataUrl: string,
  transformation: SyntheticTransformation
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Canvas not available"));

      ctx.drawImage(img, 0, 0);

      switch (transformation.type) {
        case "gaussian-blur": {
          const strength = (transformation.parameters.strength as number) || 5;
          ctx.filter = `blur(${strength}px)`;
          ctx.drawImage(canvas, 0, 0);
          ctx.filter = "none";
          break;
        }
        case "underexposure": {
          const factor = (transformation.parameters.factor as number) || 0.3;
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          for (let i = 0; i < imageData.data.length; i += 4) {
            imageData.data[i] = Math.round(imageData.data[i] * factor);
            imageData.data[i + 1] = Math.round(imageData.data[i + 1] * factor);
            imageData.data[i + 2] = Math.round(imageData.data[i + 2] * factor);
          }
          ctx.putImageData(imageData, 0, 0);
          break;
        }
        case "overexposure": {
          const factor = (transformation.parameters.factor as number) || 1.8;
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          for (let i = 0; i < imageData.data.length; i += 4) {
            imageData.data[i] = Math.min(255, Math.round(imageData.data[i] * factor));
            imageData.data[i + 1] = Math.min(255, Math.round(imageData.data[i + 1] * factor));
            imageData.data[i + 2] = Math.min(255, Math.round(imageData.data[i + 2] * factor));
          }
          ctx.putImageData(imageData, 0, 0);
          break;
        }
        case "downscale": {
          const scale = (transformation.parameters.scale as number) || 0.2;
          const w = Math.max(1, Math.round(canvas.width * scale));
          const h = Math.max(1, Math.round(canvas.height * scale));
          const tmp = document.createElement("canvas");
          tmp.width = w;
          tmp.height = h;
          const tmpCtx = tmp.getContext("2d")!;
          tmpCtx.drawImage(img, 0, 0, w, h);
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.imageSmoothingEnabled = false;
          ctx.drawImage(tmp, 0, 0, canvas.width, canvas.height);
          break;
        }
        case "noise": {
          const intensity = (transformation.parameters.intensity as number) || 30;
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          // Deterministic noise from position
          for (let i = 0; i < imageData.data.length; i += 4) {
            const noise = ((i * 7 + 13) % intensity) - intensity / 2;
            imageData.data[i] = Math.min(255, Math.max(0, imageData.data[i] + noise));
            imageData.data[i + 1] = Math.min(255, Math.max(0, imageData.data[i + 1] + noise));
            imageData.data[i + 2] = Math.min(255, Math.max(0, imageData.data[i + 2] + noise));
          }
          ctx.putImageData(imageData, 0, 0);
          break;
        }
        case "warm-cast": {
          const strength = (transformation.parameters.strength as number) || 30;
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          for (let i = 0; i < imageData.data.length; i += 4) {
            imageData.data[i] = Math.min(255, imageData.data[i] + strength);
            imageData.data[i + 2] = Math.max(0, imageData.data[i + 2] - strength / 2);
          }
          ctx.putImageData(imageData, 0, 0);
          break;
        }
        case "cool-cast": {
          const strength = (transformation.parameters.strength as number) || 30;
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          for (let i = 0; i < imageData.data.length; i += 4) {
            imageData.data[i] = Math.max(0, imageData.data[i] - strength / 2);
            imageData.data[i + 2] = Math.min(255, imageData.data[i + 2] + strength);
          }
          ctx.putImageData(imageData, 0, 0);
          break;
        }
        case "reduce-saturation": {
          const factor = (transformation.parameters.factor as number) || 0.3;
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          for (let i = 0; i < imageData.data.length; i += 4) {
            const gray = imageData.data[i] * 0.299 + imageData.data[i + 1] * 0.587 + imageData.data[i + 2] * 0.114;
            imageData.data[i] = Math.round(gray * (1 - factor) + imageData.data[i] * factor);
            imageData.data[i + 1] = Math.round(gray * (1 - factor) + imageData.data[i + 1] * factor);
            imageData.data[i + 2] = Math.round(gray * (1 - factor) + imageData.data[i + 2] * factor);
          }
          ctx.putImageData(imageData, 0, 0);
          break;
        }
        case "add-headroom": {
          const extra = (transformation.parameters.pixels as number) || 100;
          const newCanvas = document.createElement("canvas");
          newCanvas.width = canvas.width;
          newCanvas.height = canvas.height + extra;
          const newCtx = newCanvas.getContext("2d")!;
          newCtx.fillStyle = "#808080";
          newCtx.fillRect(0, 0, newCanvas.width, extra);
          newCtx.drawImage(canvas, 0, extra);
          canvas.width = newCanvas.width;
          canvas.height = newCanvas.height;
          ctx.drawImage(newCanvas, 0, 0);
          break;
        }
        case "crop": {
          const topPct = (transformation.parameters.top as number) || 0.3;
          const bottomPct = (transformation.parameters.bottom as number) || 0.9;
          const cropH = Math.round(canvas.height * (bottomPct - topPct));
          const cropY = Math.round(canvas.height * topPct);
          const imageData = ctx.getImageData(0, cropY, canvas.width, cropH);
          canvas.height = cropH;
          ctx.putImageData(imageData, 0, 0);
          break;
        }
      }

        case "motion-blur": {
          const angle = ((transformation.parameters.angle as number) || 0) * Math.PI / 180;
          const len = (transformation.parameters.length as number) || 5;
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const out = ctx.createImageData(canvas.width, canvas.height);
          const dx = Math.cos(angle) * len;
          const dy = Math.sin(angle) * len;
          for (let y = 0; y < canvas.height; y++) {
            for (let x = 0; x < canvas.width; x++) {
              let r = 0, g = 0, b = 0, count = 0;
              for (let s = -len; s <= len; s++) {
                const sx = Math.round(x - dx * s / len);
                const sy = Math.round(y - dy * s / len);
                if (sx >= 0 && sx < canvas.width && sy >= 0 && sy < canvas.height) {
                  const idx = (sy * canvas.width + sx) * 4;
                  r += imageData.data[idx]; g += imageData.data[idx + 1]; b += imageData.data[idx + 2];
                  count++;
                }
              }
              const idx = (y * canvas.width + x) * 4;
              out.data[idx] = r / count; out.data[idx + 1] = g / count; out.data[idx + 2] = b / count; out.data[idx + 3] = 255;
            }
          }
          ctx.putImageData(out, 0, 0);
          break;
        }
        case "rotate": {
          const degrees = (transformation.parameters.degrees as number) || 0;
          const rad = degrees * Math.PI / 180;
          const tmp = document.createElement("canvas");
          tmp.width = canvas.width; tmp.height = canvas.height;
          const tmpCtx = tmp.getContext("2d")!;
          tmpCtx.translate(canvas.width / 2, canvas.height / 2);
          tmpCtx.rotate(rad);
          tmpCtx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = "#808080";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(tmp, 0, 0);
          break;
        }
        case "perspective": {
          const skewX = (transformation.parameters.skewX as number) || 0;
          const skewY = (transformation.parameters.skewY as number) || 0;
          ctx.setTransform(1, skewY, skewX, 1, 0, 0);
          ctx.drawImage(img, 0, 0);
          ctx.setTransform(1, 0, 0, 1, 0, 0);
          break;
        }
        case "contrast": {
          const factor = (transformation.parameters.factor as number) || 1;
          const intercept = 128 * (1 - factor);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          for (let i = 0; i < imageData.data.length; i += 4) {
            imageData.data[i] = Math.min(255, Math.max(0, imageData.data[i] * factor + intercept));
            imageData.data[i + 1] = Math.min(255, Math.max(0, imageData.data[i + 1] * factor + intercept));
            imageData.data[i + 2] = Math.min(255, Math.max(0, imageData.data[i + 2] * factor + intercept));
          }
          ctx.putImageData(imageData, 0, 0);
          break;
        }
        case "saturation": {
          const factor = (transformation.parameters.factor as number) || 1;
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          for (let i = 0; i < imageData.data.length; i += 4) {
            const gray = imageData.data[i] * 0.299 + imageData.data[i + 1] * 0.587 + imageData.data[i + 2] * 0.114;
            imageData.data[i] = Math.min(255, Math.max(0, gray + factor * (imageData.data[i] - gray)));
            imageData.data[i + 1] = Math.min(255, Math.max(0, gray + factor * (imageData.data[i + 1] - gray)));
            imageData.data[i + 2] = Math.min(255, Math.max(0, gray + factor * (imageData.data[i + 2] - gray)));
          }
          ctx.putImageData(imageData, 0, 0);
          break;
        }
        case "screenshot": {
          // ponytail: draw mobile UI chrome around the original image
          const barHeight = (transformation.parameters.barHeight as number) || 40;
          const marginColor = transformation.parameters.marginColor || "#000000";
          const embedScale = (transformation.parameters.embedScale as number) || 0.7;
          const newW = Math.round(w / embedScale);
          const newH = Math.round(h / embedScale);
          const offX = Math.round((newW - w) / 2);
          const offY = barHeight + Math.round((newH - barHeight - h) / 2);
          const newCanvas = document.createElement("canvas");
          newCanvas.width = newW;
          newCanvas.height = newH;
          const nctx = newCanvas.getContext("2d")!;
          // Fill background
          nctx.fillStyle = marginColor;
          nctx.fillRect(0, 0, newW, newH);
          // Status bar
          nctx.fillStyle = "#1a1a1a";
          nctx.fillRect(0, 0, newW, barHeight);
          nctx.fillStyle = "#ffffff";
          nctx.font = "bold 12px sans-serif";
          nctx.fillText("9:41", 12, barHeight - 14);
          nctx.fillText("100%", newW - 40, barHeight - 14);
          // Embed the original image
          nctx.drawImage(canvas, offX, offY, w, h);
          // Navigation bar at bottom
          const navH = Math.round(newH * 0.06);
          nctx.fillStyle = "#1a1a1a";
          nctx.fillRect(0, newH - navH, newW, navH);
          // Home indicator
          nctx.fillStyle = "#666666";
          nctx.fillRect(Math.round(newW / 2 - 40), newH - 8, 80, 4);
          canvas.width = newW;
          canvas.height = newH;
          ctx.drawImage(newCanvas, 0, 0);
          break;
        }
        case "background-clutter": {
          // ponytail: add random rectangles and circles to simulate clutter
          const density = (transformation.parameters.density as number) || 20;
          const seed = 42; // deterministic
          for (let i = 0; i < density; i++) {
            const hash = ((i * 2654435761 + seed) >>> 0) % 1000 / 1000;
            const hash2 = ((i * 2246822519 + seed) >>> 0) % 1000 / 1000;
            const hash3 = ((i * 3266489917 + seed) >>> 0) % 1000 / 1000;
            const x = Math.round(hash * w);
            const y = Math.round(hash2 * h);
            const size = Math.round(10 + hash3 * 40);
            const r = Math.round(hash * 200 + 55);
            const g = Math.round(hash2 * 200 + 55);
            const b = Math.round(hash3 * 200 + 55);
            ctx.fillStyle = "rgb(" + r + "," + g + "," + b + ")";
            if (i % 3 === 0) {
              ctx.fillRect(x, y, size, size);
            } else {
              ctx.beginPath();
              ctx.arc(x, y, size / 2, 0, Math.PI * 2);
              ctx.fill();
            }
          }
          break;
        }
      resolve(canvas.toDataURL("image/jpeg", 0.92));
    };
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = imageDataUrl;
  });
}

/** Deterministic transformation parameters for evaluation */
export const EVALUATION_TRANSFORMATIONS: SyntheticTransformation[] = [
  { id: "blur-mild", sourceImageId: "source-1", type: "gaussian-blur", parameters: { strength: 3 } },
  { id: "blur-severe", sourceImageId: "source-1", type: "gaussian-blur", parameters: { strength: 12 } },
  { id: "underexpose-mild", sourceImageId: "source-1", type: "underexposure", parameters: { factor: 0.5 } },
  { id: "underexpose-severe", sourceImageId: "source-1", type: "underexposure", parameters: { factor: 0.15 } },
  { id: "overexpose-mild", sourceImageId: "source-1", type: "overexposure", parameters: { factor: 1.5 } },
  { id: "overexpose-severe", sourceImageId: "source-1", type: "overexposure", parameters: { factor: 2.5 } },
  { id: "downscale-low", sourceImageId: "source-1", type: "downscale", parameters: { scale: 0.15 } },
  { id: "noise-heavy", sourceImageId: "source-1", type: "noise", parameters: { intensity: 50 } },
  { id: "warm-cast", sourceImageId: "source-1", type: "warm-cast", parameters: { strength: 40 } },
  { id: "cool-cast", sourceImageId: "source-1", type: "cool-cast", parameters: { strength: 40 } },
  { id: "desaturate", sourceImageId: "source-1", type: "reduce-saturation", parameters: { factor: 0.1 } },
  { id: "add-headroom", sourceImageId: "source-1", type: "add-headroom", parameters: { pixels: 150 } },
  { id: "aggressive-crop", sourceImageId: "source-1", type: "crop", parameters: { top: 0.4, bottom: 0.7 } },
];

// ─── Additional transformations ───

const EXTRA_TRANSFORMATIONS: SyntheticTransformation[] = [
  // Motion blur
  { id: "motion-blur-mild", sourceImageId: "source-1", type: "motion-blur", parameters: { angle: 0, length: 5 } },
  { id: "motion-blur-severe", sourceImageId: "source-1", type: "motion-blur", parameters: { angle: 0, length: 20 } },
  // Defocus blur (simulated via variable-radius blur)
  { id: "defocus-mild", sourceImageId: "source-1", type: "gaussian-blur", parameters: { strength: 2 } },
  { id: "defocus-severe", sourceImageId: "source-1", type: "gaussian-blur", parameters: { strength: 8 } },
  // Rotation
  { id: "rotate-15deg", sourceImageId: "source-1", type: "rotate", parameters: { degrees: 15 } },
  { id: "rotate-45deg", sourceImageId: "source-1", type: "rotate", parameters: { degrees: 45 } },
  // Perspective (simulated via skew)
  { id: "perspective-skew", sourceImageId: "source-1", type: "perspective", parameters: { skewX: 0.15, skewY: 0 } },
  // Highlight clipping
  { id: "highlight-clip", sourceImageId: "source-1", type: "overexposure", parameters: { factor: 3.0 } },
  // Shadow clipping
  { id: "shadow-clip", sourceImageId: "source-1", type: "underexposure", parameters: { factor: 0.05 } },
  // Excessive contrast
  { id: "high-contrast", sourceImageId: "source-1", type: "contrast", parameters: { factor: 2.0 } },
  { id: "low-contrast", sourceImageId: "source-1", type: "contrast", parameters: { factor: 0.4 } },
  // Excessive saturation
  { id: "high-saturation", sourceImageId: "source-1", type: "saturation", parameters: { factor: 2.0 } },
  // Upscale (blur then resize back)
  { id: "upscale-artifact", sourceImageId: "source-1", type: "gaussian-blur", parameters: { strength: 1.5 } },
  // Multiple severity levels for blur
  { id: "blur-extreme", sourceImageId: "source-1", type: "gaussian-blur", parameters: { strength: 25 } },
  // Multiple severity levels for exposure
  { id: "underexpose-extreme", sourceImageId: "source-1", type: "underexposure", parameters: { factor: 0.03 } },
  { id: "overexpose-extreme", sourceImageId: "source-1", type: "overexposure", parameters: { factor: 4.0 } },
  // Composition: excessive headroom
  { id: "headroom-excessive", sourceImageId: "source-1", type: "add-headroom", parameters: { pixels: 300 } },
  // Composition: aggressive crop
  { id: "crop-face-cut", sourceImageId: "source-1", type: "crop", parameters: { top: 0.0, bottom: 0.3 } },
  // Composition: subject too small (downscale)
  { id: "subject-tiny", sourceImageId: "source-1", type: "downscale", parameters: { scale: 0.08 } },
];

export const ALL_TRANSFORMATIONS = [...EVALUATION_TRANSFORMATIONS, ...EXTRA_TRANSFORMATIONS];

// ─── Screenshot and background-clutter variants ───

const SCREENSHOT_AND_CLUTTER: SyntheticTransformation[] = [
  // Screenshot variants
  { id: "screenshot-mobile", sourceImageId: "source-1", type: "screenshot", parameters: { barHeight: 40, embedScale: 0.7, marginColor: "#000000" } },
  { id: "screenshot-light", sourceImageId: "source-1", type: "screenshot", parameters: { barHeight: 36, embedScale: 0.65, marginColor: "#f5f5f5" } },
  { id: "screenshot-small-embed", sourceImageId: "source-1", type: "screenshot", parameters: { barHeight: 40, embedScale: 0.4, marginColor: "#000000" } },
  // Background clutter variants
  { id: "clutter-mild", sourceImageId: "source-1", type: "background-clutter", parameters: { density: 10 } },
  { id: "clutter-moderate", sourceImageId: "source-1", type: "background-clutter", parameters: { density: 30 } },
  { id: "clutter-severe", sourceImageId: "source-1", type: "background-clutter", parameters: { density: 60 } },
];

export const ALL_TRANSFORMATIONS = [...EVALUATION_TRANSFORMATIONS, ...EXTRA_TRANSFORMATIONS, ...SCREENSHOT_AND_CLUTTER];
