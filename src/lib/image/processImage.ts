export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export interface ImageDimensions {
  width: number;
  height: number;
}

export interface CompressOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

export interface CompressResult {
  dataUrl: string;
  width: number;
  height: number;
}

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 8 * 1024 * 1024;

export function validateImageFile(file: File): ValidationResult {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: "Only JPEG, PNG, and WebP images are accepted.",
    };
  }
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: "File size exceeds 8 MB. Please choose a smaller image.",
    };
  }
  return { valid: true };
}

export function getImageDimensions(file: File): Promise<ImageDimensions> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => resolve({ width: img.width, height: img.height });
      img.onerror = () => reject(new Error("Failed to decode image"));
      img.src = reader.result as string;
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

// ponytail: robust image compression — createImageBitmap first, Image fallback
// Returns data URL for localStorage compatibility in audit store
export async function compressImageToDataUrl(
  file: File,
  options: CompressOptions = {}
): Promise<CompressResult> {
  const { maxWidth = 1600, maxHeight = 1600, quality = 0.85 } = options;

  if (!file || file.size === 0) throw new Error("IMAGE_FILE_MISSING");

  // Try createImageBitmap first (no DOM, works in workers)
  let bitmap: ImageBitmap | null = null;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    // fallback below
  }

  let imgWidth: number, imgHeight: number, drawToCanvas: (ctx: CanvasRenderingContext2D, w: number, h: number) => void;

  if (bitmap) {
    imgWidth = bitmap.width;
    imgHeight = bitmap.height;
    drawToCanvas = (ctx, w, h) => { ctx.drawImage(bitmap!, 0, 0, w, h); };
  } else {
    // Fallback: Image element
    const url = URL.createObjectURL(file);
    try {
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const el = new Image();
        el.onload = () => resolve(el);
        el.onerror = () => reject(new Error("IMAGE_DECODE_FAILED"));
        el.src = url;
      });
      // Try image.decode() for mobile browsers
      if (typeof img.decode === "function") {
        try { await img.decode(); } catch { /* decode() failed, continue */ }
      }
      imgWidth = img.naturalWidth || img.width;
      imgHeight = img.naturalHeight || img.height;
      drawToCanvas = (ctx, w, h) => { ctx.drawImage(img, 0, 0, w, h); };
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  if (imgWidth === 0 || imgHeight === 0) throw new Error("IMAGE_DECODE_FAILED");

  // Scale down
  let width = imgWidth, height = imgHeight;
  if (width > maxWidth || height > maxHeight) {
    const ratio = Math.min(maxWidth / width, maxHeight / height);
    width = Math.round(width * ratio);
    height = Math.round(height * ratio);
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("CANVAS_FAILED");

  drawToCanvas(ctx, width, height);

  // Convert to blob then data URL
  const mime = file.type === "image/png" ? "image/png" : "image/jpeg";
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => b ? resolve(b) : reject(new Error("CANVAS_TO_BLOB_FAILED")), mime, quality);
  });

  // Clean canvas
  canvas.width = 0;
  canvas.height = 0;

  const dataUrl = await new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = () => reject(new Error("BLOB_READ_FAILED"));
    r.readAsDataURL(blob);
  });

  if (bitmap) bitmap.close();

  return { dataUrl, width, height };
}

export function estimateDataUrlSize(dataUrl: string): number {
  const base64 = dataUrl.split(",")[1] || "";
  return Math.round((base64.length * 3) / 4);
}
