"use client";

import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { PhotoRankerWidget } from "@/components/vision/PhotoRankerWidget";

export default function PhotoRankerPage() {
  return (
    <Container className="py-12">
      <div className="mx-auto max-w-3xl">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#B23A25]">AI Photo Ranker</p>
        <h1 className="text-3xl font-bold tracking-tight text-[#1C1917] sm:text-4xl">Upload your photos — we&apos;ll pick your lead</h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-[#4a443d]">
          Your lead photo decides ~80% of your matches. Drop in the shots you&apos;re choosing between and an on-device AI ranks
          them — which to open with, which to keep, which to cut — scoring how well each one <em>communicates</em>, not how you look.
        </p>
        <p className="mt-2 text-xs text-[#857b6e]">🔒 Runs entirely in your browser. Your photos never leave your device.</p>

        <div className="my-8">
          <PhotoRankerWidget />
        </div>

        <div className="rounded-2xl border border-[#1c1917]/[0.1] bg-[#1c1917]/[0.03] p-5 text-center">
          <p className="text-sm font-semibold text-[#1C1917]">Want the full read on your lead photo?</p>
          <p className="mx-auto mt-1 max-w-md text-xs text-[#6f675e]">The free Aura scan breaks down exactly why it scores where it does — lighting, expression, background — and the fixes.</p>
          <Link href="/audit/new" className="mt-3 inline-flex rounded-xl bg-[#1C1917] px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5">
            Scan my lead photo — free →
          </Link>
        </div>
      </div>
    </Container>
  );
}
