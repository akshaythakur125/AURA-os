import type { Lead } from "@/types/lead";

const STORAGE_KEY = "auracheck:v1:leads";

export function getLeads(): Lead[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLeads(leads: Lead[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
  } catch {
    // storage full — ignore
  }
}

export function createLead(data: { name?: string; contact?: string; interestProduct?: string; note?: string; source: string }): Lead {
  const lead: Lead = {
    id: crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: data.name,
    contact: data.contact,
    interestProduct: data.interestProduct as Lead["interestProduct"],
    note: data.note,
    source: data.source,
    createdAt: new Date().toISOString(),
  };
  const leads = getLeads();
  leads.push(lead);
  saveLeads(leads);
  return lead;
}

export function deleteLead(id: string): void {
  const leads = getLeads().filter((l) => l.id !== id);
  saveLeads(leads);
}

export function clearLeads(): void {
  saveLeads([]);
}

export function exportLeads(): string {
  const leads = getLeads();
  const headers = ["id", "name", "contact", "interestProduct", "note", "source", "createdAt"];
  const rows = leads.map((l) => headers.map((h) => JSON.stringify((l as unknown as Record<string, unknown>)[h] ?? "")).join(","));
  return [headers.join(","), ...rows].join("\n");
}
