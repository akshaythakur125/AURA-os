import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { HAIRCUT_GUIDES } from "@/lib/seo/haircutGuides";

export const metadata: Metadata = {
  title: "Best Haircuts for Your Face Shape — Free Face-Shape Finder | AuraCheck",
  description: "Find the most flattering haircut for your face shape. Free in-browser face-shape scan, plus cut guides for oval, round, square, oblong, heart and diamond faces.",
  alternates: { canonical: "/haircuts-for-your-face-shape" },
};

export default function HaircutGuideIndex() {
  return (
    <Container className="py-12">
      <div className="mx-auto max-w-2xl">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#B23A25]">Face-shape haircut guide</p>
        <h1 className="text-3xl font-bold tracking-tight text-[#1C1917] sm:text-4xl">Best haircuts for your face shape</h1>
        <p className="mt-4 text-base leading-relaxed text-[#4a443d]">
          The right cut balances your proportions and does half the styling work for you. Pick your face shape below for the full guide — or let AuraCheck detect it from one photo, free and in your browser.
        </p>

        <div className="my-8 rounded-2xl border border-[#E14434]/20 bg-gradient-to-b from-[#E14434]/[0.06] to-transparent p-5 text-center">
          <p className="text-sm font-semibold text-[#1C1917]">Don&apos;t know your face shape?</p>
          <p className="mx-auto mt-1 max-w-sm text-xs text-[#6f675e]">Upload one photo — we detect it in seconds, privately, on your device.</p>
          <Link href="/audit/new" className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-[#1C1917] px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5">
            Scan my face shape — free →
          </Link>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {HAIRCUT_GUIDES.map((g) => (
            <Link
              key={g.slug}
              href={`/haircuts-for-your-face-shape/${g.slug}`}
              className="rounded-2xl border border-[#1c1917]/[0.08] bg-[#fbf8f2]/60 p-4 transition-all hover:-translate-y-0.5 hover:border-[#E14434]/30"
            >
              <p className="text-base font-bold text-[#1C1917]">{g.shape} face</p>
              <p className="mt-1 text-xs text-[#6f675e]">Best haircuts for a {g.shapeLower} face →</p>
            </Link>
          ))}
        </div>
      </div>
    </Container>
  );
}
