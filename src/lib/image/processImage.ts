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

// Reject a hung promise after `ms` so decode/encode can never block forever.
function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(label)), ms);
    promise.then(
      (v) => { clearTimeout(timer); resolve(v); },
      (e) => { clearTimeout(timer); reject(e); }
    );
  });
}

// ponytail: robust image compression — createImageBitmap first, Image fallback.
// Every async step is time-boxed so a photo that stalls decode/encode (large
// files, HEIC re-encodes, odd EXIF) surfaces an error instead of hanging.
// Returns data URL for localStorage compatibility in audit store.
export async function compressImageToDataUrl(
  file: File,
  options: CompressOptions = {}
): Promise<CompressResult> {
  // Keep the stored data URL small enough for localStorage (base64 of a 1600px
  // photo can be ~1MB and overflow the ~5MB quota). 1200px @ 0.72 is ~200KB and
  // still ample for the presentation analysis.
  const { maxWidth = 1200, maxHeight = 1200, quality = 0.72 } = options;

  if (!file || file.size === 0) throw new Error("IMAGE_FILE_MISSING");

  // Try createImageBitmap first (no DOM, works in workers) — time-boxed
  let bitmap: ImageBitmap | null = null;
  try {
    bitmap = await withTimeout(createImageBitmap(file), 12000, "BITMAP_TIMEOUT");
  } catch {
    // fallback below (covers both decode failure and timeout)
  }

  let imgWidth: number, imgHeight: number, drawToCanvas: (ctx: CanvasRenderingContext2D, w: number, h: number) => void;

  if (bitmap) {
    imgWidth = bitmap.width;
    imgHeight = bitmap.height;
    drawToCanvas = (ctx, w, h) => { ctx.drawImage(bitmap!, 0, 0, w, h); };
  } else {
    // Fallback: Image element — load is time-boxed so onload/onerror never hanging is fatal
    const url = URL.createObjectURL(file);
    try {
      const img = await withTimeout(
        new Promise<HTMLImageElement>((resolve, reject) => {
          const el = new Image();
          el.onload = () => resolve(el);
          el.onerror = () => reject(new Error("IMAGE_DECODE_FAILED"));
          el.src = url;
        }),
        12000,
        "IMAGE_LOAD_TIMEOUT"
      );
      // Try image.decode() for mobile browsers (time-boxed, best-effort)
      if (typeof img.decode === "function") {
        try { await withTimeout(img.decode(), 8000, "IMAGE_DECODE_TIMEOUT"); } catch { /* continue */ }
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

  // Convert to blob then data URL — both time-boxed
  const mime = file.type === "image/png" ? "image/png" : "image/jpeg";
  const blob = await withTimeout(
    new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((b) => b ? resolve(b) : reject(new Error("CANVAS_TO_BLOB_FAILED")), mime, quality);
    }),
    12000,
    "CANVAS_TO_BLOB_TIMEOUT"
  );

  // Clean canvas
  canvas.width = 0;
  canvas.height = 0;

  const dataUrl = await withTimeout(
    new Promise<string>((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result as string);
      r.onerror = () => reject(new Error("BLOB_READ_FAILED"));
      r.readAsDataURL(blob);
    }),
    12000,
    "BLOB_READ_TIMEOUT"
  );

  if (bitmap) bitmap.close();

  return { dataUrl, width, height };
}

export function estimateDataUrlSize(dataUrl: string): number {
  const base64 = dataUrl.split(",")[1] || "";
  return Math.round((base64.length * 3) / 4);
}
