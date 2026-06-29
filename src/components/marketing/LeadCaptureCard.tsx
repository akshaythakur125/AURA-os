"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { createLead } from "@/lib/storage/leadStore";
import { trackEvent } from "@/lib/storage/analyticsStore";
import type { ProductType } from "@/types/payment";

interface LeadCaptureCardProps {
  source: string;
  defaultProduct?: ProductType;
}

export function LeadCaptureCard({
  source,
  defaultProduct,
}: LeadCaptureCardProps) {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [interestProduct, setInterestProduct] = useState<ProductType | "">(
    defaultProduct || ""
  );
  const [note, setNote] = useState("");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ownerWhatsApp =
    typeof process !== "undefined" &&
    process.env &&
    (process.env as Record<string, string | undefined>)
      .NEXT_PUBLIC_OWNER_WHATSAPP
      ? ((process.env as Record<string, string | undefined>)
          .NEXT_PUBLIC_OWNER_WHATSAPP as string)
      : null;

  function buildContactMessage(): string {
    const lines = [
      "AuraCheck — Contact/Interest",
      name ? `Name: ${name}` : null,
      contact ? `Contact: ${contact}` : null,
      interestProduct ? `Interested in: ${interestProduct}` : null,
      note ? `Note: ${note}` : null,
    ].filter(Boolean);
    return encodeURIComponent(lines.join("\n"));
  }

  function handleSave() {
    setError(null);
    if (!contact.trim() && !name.trim()) {
      setError("Please enter your name or WhatsApp contact.");
      return;
    }
    try {
      createLead({
        name: name.trim() || undefined,
        contact: contact.trim() || undefined,
        interestProduct: (interestProduct as ProductType) || undefined,
        note: note.trim() || undefined,
        source,
      });
      trackEvent({ eventName: "lead_created", metadata: { source } });
      setSaved(true);
    } catch {
      setError("Could not save. Please try again.");
    }
  }

  if (saved) {
    return (
      <Card>
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10">
            <svg
              className="h-6 w-6 text-emerald-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <p className="mb-2 text-sm font-medium text-white">
            Contact saved locally
          </p>
          <p className="mb-4 text-xs text-gray-500">
            Copy the message below and send it to the owner to let them know
            you are interested.
          </p>
          <div className="mb-3 flex justify-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                navigator.clipboard.writeText(
                  decodeURIComponent(buildContactMessage())
                );
              }}
            >
              Copy Message
            </Button>
            {ownerWhatsApp && (
              <a
                href={`https://wa.me/${ownerWhatsApp.replace(/[^0-9]/g, "")}?text=${buildContactMessage()}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button size="sm">Send on WhatsApp</Button>
              </a>
            )}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <h4 className="mb-1 text-sm font-semibold text-white">
        Want unlock help?
      </h4>
      <p className="mb-4 text-xs text-gray-500">
        Save your contact locally and copy a message to send to the owner.
      </p>
      <div className="space-y-3">
        <div>
          <label className="mb-1 block text-xs text-gray-500">
            Your name <span className="text-gray-600">(optional)</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Rahul"
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-purple-500/50 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-gray-500">
            WhatsApp / contact <span className="text-gray-600">(optional)</span>
          </label>
          <input
            type="text"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder="e.g. +91 98765 43210"
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-purple-500/50 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-gray-500">
            Interested product{" "}
            <span className="text-gray-600">(optional)</span>
          </label>
          <select
            value={interestProduct}
            onChange={(e) => setInterestProduct(e.target.value as ProductType | "")}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-purple-500/50 focus:outline-none"
          >
            <option value="">Not sure yet</option>
            <option value="aura_report">Full Aura Report — ₹99</option>
            <option value="dating_audit">Dating / Profile Audit — ₹299</option>
            <option value="glowup_plan">30-Day Glow-Up Plan — ₹499</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs text-gray-500">
            Note <span className="text-gray-600">(optional)</span>
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Any questions or requests..."
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-purple-500/50 focus:outline-none"
            rows={2}
          />
        </div>

        {error && (
          <p className="rounded-lg bg-red-500/10 p-2 text-xs text-red-400">
            {error}
          </p>
        )}

        <Button className="w-full" size="sm" onClick={handleSave}>
          Save Contact
        </Button>
      </div>
    </Card>
  );
}
