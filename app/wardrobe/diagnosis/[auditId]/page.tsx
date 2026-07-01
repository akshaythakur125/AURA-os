"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { VisualWardrobeSection } from "@/components/visual-wardrobe/VisualWardrobeSection";
import type { VisualWardrobeDiagnosis } from "@/types/visualWardrobe";
import type { Audit } from "@/types";

export default function AuditWardrobeDiagnosisPage({ params }: { params: Promise<{ auditId: string }> }) {
  const { auditId } = use(params);
  const [audit, setAudit] = useState<Audit | null>(null);
  const [diagnosis, setDiagnosis] = useState<VisualWardrobeDiagnosis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.resolve().then(async () => {
      try {
        const { getAuditById } = await import("@/lib/storage/auditStore");
        const a = getAuditById(auditId);
        if (!a) { setError("Audit not found"); setLoading(false); return; }
        setAudit(a);

        if (!a.imageDataUrl) { setError("No image found in this audit"); setLoading(false); return; }

        const { getDiagnosisByAudit } = await import("@/lib/storage/visualWardrobeStore");
        const existing = getDiagnosisByAudit(auditId);
        if (existing) { setDiagnosis(existing); setLoading(false); return; }

        const { generateVisualWardrobeDiagnosis } = await import("@/lib/visual-wardrobe/visualWardrobeDiagnosis");
        const result = await generateVisualWardrobeDiagnosis(a.imageDataUrl, {
          audit: a,
          onProgress: () => {},
        });
        setDiagnosis(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Diagnosis failed");
      }
      setLoading(false);
    });
  }, [auditId]);

  if (loading) {
    return (
      <Container className="py-12">
        <div className="mx-auto max-w-md text-center">
          <div className="mb-4 h-2 w-full overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-1/2 animate-pulse rounded-full bg-purple-500" />
          </div>
          <p className="text-sm text-gray-400">Running visual wardrobe diagnosis...</p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-12">
        <div className="mx-auto max-w-md text-center">
          <h1 className="mb-4 text-2xl font-bold text-white">Diagnosis Unavailable</h1>
          <p className="mb-6 text-sm text-gray-400">{error}</p>
          <div className="flex justify-center gap-3">
            {audit && <Link href={`/audit/${auditId}`}><Button variant="outline">Back to Audit</Button></Link>}
            <Link href="/wardrobe/diagnosis"><Button>Try New Diagnosis</Button></Link>
          </div>
        </div>
      </Container>
    );
  }

  if (!diagnosis) {
    return (
      <Container className="py-12">
        <div className="mx-auto max-w-md text-center">
          <p className="text-sm text-gray-400">No diagnosis available.</p>
          <Link href="/wardrobe/diagnosis"><Button className="mt-4">New Diagnosis</Button></Link>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-8 sm:py-12">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6">
          <Link href={`/audit/${auditId}`} className="text-xs text-purple-400 hover:underline">&larr; Back to audit</Link>
        </div>

        <div className="mb-8 text-center">
          <h1 className="mb-3 text-3xl font-bold text-white">Your Visual Wardrobe Diagnosis</h1>
          <p className="text-sm text-gray-400">Based on your Aura Check photo analysis.</p>
        </div>

        {audit?.imageDataUrl && (
          <div className="mb-6 flex justify-center">
            <img src={audit.imageDataUrl} alt="Audit" className="h-40 w-auto rounded-lg object-cover" />
          </div>
        )}

        <VisualWardrobeSection diagnosis={diagnosis} />
      </div>
    </Container>
  );
}
