"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { createLead } from "@/lib/storage/leadStore";
import { trackEvent } from "@/lib/storage/analyticsStore";
import type { ProductType } from "@/types";
import { PRODUCT_LABELS, PRODUCT_PRICES } from "@/lib/audit/auditUtils";

const PRODUCT_NAMES = PRODUCT_LABELS;

interface LeadCaptureCardProps {
  source: string;
  defaultProduct?: ProductType;
}

export function LeadCaptureCard({ source, defaultProduct }: LeadCaptureCardProps) {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [interestProduct, setInterestProduct] = useState<ProductType | "">(defaultProduct || "");
  const [note, setNote] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const ownerWhatsApp = typeof process !== "undefined" ? process.env.NEXT_PUBLIC_OWNER_WHATSAPP : "";

  function handleSave() {
    setSaving(true);
    try {
      createLead({
        name: name.trim() || undefined,
        contact: contact.trim() || undefined,
        interestProduct: (interestProduct as ProductType) || undefined,
        note: note.trim() || undefined,
        source,
      });
      trackEvent("lead_created", { source, product: interestProduct || "none" });
      setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  const leadText = `AuraCheck Lead\nName: ${name || "—"}\nContact: ${contact || "—"}\nInterested: ${interestProduct ? PRODUCT_NAMES[interestProduct as ProductType] : "—"}\nNote: ${note || "—"}\nSource: ${source}`;
  const waUrl = ownerWhatsApp ? `https://wa.me/${ownerWhatsApp.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(leadText)}` : "";

  if (saved) {
    return (
      <Card className="border-emerald-500/20">
        <h3 className="mb-2 text-sm font-semibold text-emerald-400">Interest Saved!</h3>
        <p className="mb-3 text-xs text-gray-400">Your interest has been saved locally. Share it with the owner to get notified about this product.</p>
        <div className="flex flex-wrap gap-2">
          <Button variant="ghost" size="sm" onClick={() => navigator.clipboard.writeText(leadText)}>Copy Message</Button>
          {waUrl && <a href={waUrl} target="_blank" rel="noopener noreferrer"><Button variant="outline" size="sm">Send via WhatsApp</Button></a>}
        </div>
        <p className="mt-2 text-[10px] text-gray-600">Local-only storage cannot automatically notify the owner. Please share manually.</p>
      </Card>
    );
  }

  return (
    <Card>
      <h3 className="mb-3 text-sm font-semibold text-white">Interested? Leave your details</h3>
      <div className="space-y-3">
        <div>
          <label className="mb-1 block text-xs text-gray-500">Name (optional)</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-gray-600 focus:border-purple-500/50 focus:outline-none" />
        </div>
        <div>
          <label className="mb-1 block text-xs text-gray-500">WhatsApp / Contact (optional)</label>
          <input type="text" value={contact} onChange={(e) => setContact(e.target.value)} placeholder="+91 98765 43210" className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-gray-600 focus:border-purple-500/50 focus:outline-none" />
        </div>
        <div>
          <label className="mb-1 block text-xs text-gray-500">Interested Product</label>
          <select value={interestProduct} onChange={(e) => setInterestProduct(e.target.value as ProductType)} className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white focus:border-purple-500/50 focus:outline-none">
            <option value="">Select product</option>
            {(Object.entries(PRODUCT_NAMES) as [ProductType, string][]).map(([key, label]) => (
              <option key={key} value={key}>{label} — ₹{PRODUCT_PRICES[key]}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs text-gray-500">Note (optional)</label>
          <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Any questions..." className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-gray-600 focus:border-purple-500/50 focus:outline-none" rows={2} />
        </div>
        <Button onClick={handleSave} disabled={saving} className="w-full" size="sm">{saving ? "Saving..." : "Save Interest"}</Button>
        <p className="text-[10px] text-gray-600">Your details are saved locally in your browser. No data is sent to any server.</p>
      </div>
    </Card>
  );
}
