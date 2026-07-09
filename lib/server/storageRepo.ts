import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function uploadAuditImage(
  anonymousId: string,
  imageDataUrl: string,
  fileName?: string
): Promise<{ imagePath: string; sizeBytes: number }> {
  const supabase = getSupabaseAdmin();

  const match = imageDataUrl.match(/^data:(image\/(\w+));base64,(.+)$/);
  if (!match) {
    throw new Error("Invalid image data URL. Only jpg, png, webp are supported.");
  }

  const mimeType = match[1];
  const ext = match[2].replace("jpeg", "jpg");
  const base64Data = match[3];

  if (!["image/jpeg", "image/png", "image/webp"].includes(mimeType)) {
    throw new Error("Unsupported image format. Use jpg, png, or webp.");
  }

  const buffer = Buffer.from(base64Data, "base64");
  const sizeBytes = buffer.length;

  if (sizeBytes > 5 * 1024 * 1024) {
    throw new Error("Image too large. Max 5 MB after compression.");
  }

  const safeFileName = (fileName || "audit-image")
    .replace(/[^a-zA-Z0-9_-]/g, "_")
    .slice(0, 50);
  const timestamp = Date.now();
  const imagePath = `anonymous/${anonymousId}/${timestamp}-${safeFileName}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("audit-images")
    .upload(imagePath, buffer, {
      contentType: mimeType,
      upsert: false,
    });

  if (uploadError) {
    throw new Error(`Failed to upload image: ${uploadError.message}`);
  }

  return { imagePath, sizeBytes };
}

export async function getSignedUrl(
  imagePath: string,
  expiresInSeconds = 3600
): Promise<string> {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase.storage
    .from("audit-images")
    .createSignedUrl(imagePath, expiresInSeconds);

  if (error || !data) {
    throw new Error(`Failed to generate signed URL: ${error?.message || "Unknown error"}`);
  }

  return data.signedUrl;
}

export async function deleteImage(imagePath: string): Promise<void> {
  const supabase = getSupabaseAdmin();

  const { error } = await supabase.storage
    .from("audit-images")
    .remove([imagePath]);

  if (error) {
    throw new Error(`Failed to delete image: ${error.message}`);
  }
}
