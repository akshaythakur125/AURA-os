"use client";

import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";

export default function NewAuditPage() {
  return (
    <Container className="py-12">
      <h1 className="mb-8 text-3xl font-bold text-white">New Aura Check</h1>
      <Card>
        <p className="text-gray-400">
          Upload a photo to begin your aura analysis. All processing happens locally in your browser.
        </p>
        <div className="mt-6 rounded-xl border border-dashed border-white/10 p-12 text-center">
          <p className="text-sm text-gray-500">Upload area — coming soon</p>
        </div>
      </Card>
    </Container>
  );
}
