"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { BeforeAfterCard } from "@/components/proof/BeforeAfterCard";
import { PROOF_EXAMPLES } from "@/config/proofExamples";
import type { ProofExample, ProofCategory } from "@/types/proof";
import { trackEvent } from "@/lib/storage/analyticsStore";
import Link from "next/link";

const CATEGORY_LABELS: Record<ProofCategory, string> = {
  lighting_fix: "Lighting",
  background_fix: "Background",
  crop_fix: "Crop & Framing",
  profile_order_fix: "Dating Profile",
  grooming_base: "Grooming",
  outfit_consistency: "Outfit",
  glowup_system: "Glow-Up System",
};

export function ProofGallery() {
  const [filter, setFilter] = useState<"all" | ProofCategory>("all");

  const filtered = filter === "all" ? PROOF_EXAMPLES : PROOF_EXAMPLES.filter((e) => e.category === filter);

  const categories: ProofCategory[] = [...new Set(PROOF_EXAMPLES.map((e) => e.category))];

  return (
    <div>
      {/* Filter */}
      <div className="mb-8 flex flex-wrap gap-2">
        <button
          onClick={() => setFilter("all")}
          className={`rounded-full px-3 py-1.5 text-xs transition-all ${filter === "all" ? "bg-purple-500/20 text-purple-300" : "bg-white/5 text-gray-500 hover:text-gray-300"}`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`rounded-full px-3 py-1.5 text-xs transition-all ${filter === cat ? "bg-purple-500/20 text-purple-300" : "bg-white/5 text-gray-500 hover:text-gray-300"}`}
          >
            {CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((example) => (
          <BeforeAfterCard key={example.id} example={example} />
        ))}
      </div>

      {filtered.length === 0 && (
        <Card className="py-8 text-center text-sm text-gray-500">No examples in this category yet.</Card>
      )}
    </div>
  );
}

interface ProofStripProps {
  examples: ProofExample[];
  title?: string;
  ctaHref?: string;
  ctaText?: string;
}

export function ProofStrip({ examples, title, ctaHref, ctaText }: ProofStripProps) {
  return (
    <div>
      {title && <h3 className="mb-4 text-sm font-semibold text-white">{title}</h3>}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {examples.map((ex) => (
          <BeforeAfterCard key={ex.id} example={ex} compact />
        ))}
      </div>
      {ctaHref && ctaText && (
        <div className="mt-6 text-center">
          <Link href={ctaHref}>
            <Button variant="outline" size="sm" onClick={() => trackEvent("proof_cta_clicked", { href: ctaHref })}>
              {ctaText}
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}

interface ProofCTAProps {
  example: ProofExample;
  headline?: string;
  subheadline?: string;
}

export function ProofCTA({ example, headline, subheadline }: ProofCTAProps) {
  return (
    <Card className="border-emerald-500/20 ring-1 ring-emerald-500/20">
      {headline && <h3 className="mb-2 text-lg font-bold text-white">{headline}</h3>}
      {subheadline && <p className="mb-4 text-sm text-gray-400">{subheadline}</p>}
      <BeforeAfterCard example={example} compact />
    </Card>
  );
}
