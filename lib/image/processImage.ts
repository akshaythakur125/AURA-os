const MAX_DIMENSION = 1200;
const MAX_FILE_SIZE = 8 * 1024 * 1024;
const JPEG_QUALITY = 0.8;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export interface ProcessedImage {
  dataUrl: string;
  meta: {
    fileName: string;
    fileType: string;
    fileSize: number;
    compressedSize: number;
    width: number;
    height: number;
  };
}

export function validateImage(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return "Only JPG, PNG, and WebP files are accepted.";
  }
  if (file.size > MAX_FILE_SIZE) {
    return `File size exceeds 8 MB. Please upload a smaller file.`;
  }
  return null;
}

export function processImage(file: File): Promise<ProcessedImage> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
          const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Could not get canvas context"));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL("image/jpeg", JPEG_QUALITY);
        const compressedBytes = Math.round((dataUrl.length * 3) / 4);
        resolve({
          dataUrl,
          meta: {
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
            compressedSize: compressedBytes,
            width,
            height,
          },
        });
      };
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = reader.result as string;
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}
