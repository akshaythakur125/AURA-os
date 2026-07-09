"use client";

import { shouldUseSupabase } from "@/lib/storage/storageMode";
import { getAnonymousId } from "@/lib/identity/anonymousId";
import {
  createAudit as localCreateAudit,
  getAuditById as localGetAuditById,
  updateAudit as localUpdateAudit,
  deleteAudit as localDeleteAudit,
  getAudits,
} from "@/lib/storage/auditStore";

async function supabaseCreateAudit(input: Record<string, unknown>) {
  const res = await fetch("/api/audits", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...input, anonymousId: getAnonymousId() }),
  });
  if (!res.ok) throw new Error("Supabase create failed");
  const data = await res.json();
  return data.audit;
}

async function supabaseGetAuditById(id: string) {
  const res = await fetch(`/api/audits/${id}`);
  if (!res.ok) return null;
  const data = await res.json();
  return data.audit;
}

async function supabaseUpdateAudit(id: string, updates: Record<string, unknown>) {
  const res = await fetch(`/api/audits/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error("Supabase update failed");
  const data = await res.json();
  return data.audit;
}

async function supabaseDeleteAudit(id: string) {
  const res = await fetch(`/api/audits/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Supabase delete failed");
}

async function supabaseUploadImage(imageDataUrl: string, fileName?: string) {
  const res = await fetch("/api/storage/upload-audit-image", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      imageDataUrl,
      anonymousId: getAnonymousId(),
      fileName,
    }),
  });
  if (!res.ok) throw new Error("Image upload failed");
  return res.json();
}

async function supabaseGetSignedUrl(imagePath: string) {
  const res = await fetch("/api/storage/get-audit-image-url", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ imagePath }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.signedUrl;
}

export const auditDataSource = {
  createAudit: async (input: Record<string, unknown>) => {
    if (shouldUseSupabase()) {
      return supabaseCreateAudit(input);
    }
    return localCreateAudit(input as never);
  },

  getAuditById: async (id: string) => {
    if (shouldUseSupabase()) {
      const result = await supabaseGetAuditById(id);
      if (result) return result;
    }
    return localGetAuditById(id);
  },

  updateAudit: async (id: string, updates: Record<string, unknown>) => {
    if (shouldUseSupabase()) {
      try {
        await supabaseUpdateAudit(id, updates);
      } catch {
        // Fall through to local
      }
    }
    return localUpdateAudit(id, updates as never);
  },

  deleteAudit: async (id: string) => {
    if (shouldUseSupabase()) {
      await supabaseDeleteAudit(id);
    }
    localDeleteAudit(id);
  },

  listAudits: async () => {
    if (shouldUseSupabase()) {
      const res = await fetch(`/api/audits?anonymousId=${getAnonymousId()}`);
      if (res.ok) {
        const data = await res.json();
        return data.audits || [];
      }
    }
    return getAudits();
  },

  uploadImage: async (imageDataUrl: string, fileName?: string) => {
    if (shouldUseSupabase()) {
      return supabaseUploadImage(imageDataUrl, fileName);
    }
    return { imagePath: "", sizeBytes: 0 };
  },

  getImageSignedUrl: async (imagePath: string) => {
    if (shouldUseSupabase()) {
      return supabaseGetSignedUrl(imagePath);
    }
    return null;
  },
};
