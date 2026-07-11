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
  | "crop";

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
