"use client";

import { useState, useEffect } from "react";
import { AuraTwinWorkspace } from "@/components/aura-twin/AuraTwinWorkspace";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

export default function AuraTwinPage() {
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [auditId, setAuditId] = useState<string | null>(null);
  const [topFinding, setTopFinding] = useState<string | undefined>();

  // Load from localStorage (saved from audit flow)
  useEffect(() => {
    try {
      const saved = localStorage.getItem("aura_twin_image");
      if (saved) setImageDataUrl(saved);
      const id = localStorage.getItem("aura_twin_audit_id");
      if (id) setAuditId(id);
      const finding = localStorage.getItem("aura_twin_top_finding");
      if (finding) setTopFinding(finding);
    } catch {}
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const url = reader.result as string;
      setImageDataUrl(url);
      try { localStorage.setItem("aura_twin_image", url); } catch {}
    };
    reader.readAsDataURL(file);
  };

  if (!imageDataUrl) {
    return (
      <Container className="py-20 text-center">
        <h1 className="mb-4 text-2xl font-bold text-[#1C1917]">Aura Twin Studio</h1>
        <p className="mb-6 text-sm text-[#6f675e]">
          Upload a photo to preview improvements before making changes in real life.
        </p>
        <p className="mb-4 text-[10px] text-[#9c9184]">
          All processing happens locally in your browser. Your image never leaves your device.
        </p>
        <label className="inline-block cursor-pointer">
          <input type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
          <Button size="lg">Upload a Photo</Button>
        </label>
      </Container>
    );
  }

  return <AuraTwinWorkspace imageDataUrl={imageDataUrl} auditId={auditId ?? undefined} topFinding={topFinding} />;
}
