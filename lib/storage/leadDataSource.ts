"use client";

import { shouldUseSupabase } from "@/lib/storage/storageMode";
import {
  createLead as localCreateLead,
  getLeads as localGetLeads,
  deleteLead as localDeleteLead,
  clearLeads as localClearLeads,
} from "@/lib/storage/leadStore";

async function supabaseCreateLead(input: Record<string, unknown>) {
  const res = await fetch("/api/leads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error("Supabase create lead failed");
  const data = await res.json();
  return data.lead;
}

async function supabaseGetLeads() {
  const res = await fetch("/api/leads");
  if (!res.ok) return null;
  const data = await res.json();
  return data.leads || [];
}

async function supabaseDeleteLead(id: string) {
  const res = await fetch(`/api/leads/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Supabase delete lead failed");
}

export const leadDataSource = {
  createLead: async (input: Record<string, unknown>) => {
    if (shouldUseSupabase()) {
      try {
        return await supabaseCreateLead(input);
      } catch {
        // fall through
      }
    }
    return localCreateLead(input as never);
  },

  getLeads: async () => {
    if (shouldUseSupabase()) {
      try {
        const result = await supabaseGetLeads();
        if (result) return result;
      } catch {
        // fall through
      }
    }
    return localGetLeads();
  },

  deleteLead: async (id: string) => {
    if (shouldUseSupabase()) {
      try {
        await supabaseDeleteLead(id);
      } catch {
        // fall through
      }
    }
    localDeleteLead(id);
  },

  clearLeads: () => {
    localClearLeads();
  },
};
