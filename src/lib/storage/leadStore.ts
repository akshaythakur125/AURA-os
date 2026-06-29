import type { Lead } from "@/types/lead";
import type { ProductType } from "@/types/payment";
import { createLocalId } from "@/types/audit";
import { getItem, setItem } from "./localStore";

const LEADS_KEY = "auracheck:v1:leads";

function getAll(): Lead[] {
  return getItem<Lead[]>(LEADS_KEY, []);
}

function persist(leads: Lead[]): void {
  setItem(LEADS_KEY, leads);
}

export function getLeads(): Lead[] {
  return getAll().sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function createLead(input: {
  name?: string;
  contact?: string;
  interestProduct?: ProductType;
  note?: string;
  source: string;
}): Lead {
  const lead: Lead = {
    id: createLocalId(),
    name: input.name || undefined,
    contact: input.contact || undefined,
    interestProduct: input.interestProduct || undefined,
    note: input.note || undefined,
    source: input.source,
    createdAt: new Date().toISOString(),
  };
  const leads = getAll();
  leads.push(lead);
  persist(leads);
  return lead;
}

export function deleteLead(id: string): boolean {
  const leads = getAll();
  const filtered = leads.filter((l) => l.id !== id);
  if (filtered.length === leads.length) return false;
  persist(filtered);
  return true;
}

export function clearLeads(): void {
  setItem(LEADS_KEY, []);
}

export function exportLeads(): Lead[] {
  return getLeads();
}
