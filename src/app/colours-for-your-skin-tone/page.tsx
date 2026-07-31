import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { COLOUR_GUIDES } from "@/lib/seo/colourGuides";

export const metadata: Metadata = {
  title: "Best Colours for Your Skin Tone — Free Undertone Finder | AuraCheck",
  description: "Find the colours that make your skin glow. Free in-browser undertone scan, plus flattering-colour guides for warm, cool and neutral undertones.",
  alternates: { canonical: "/colours-for-your-skin-tone" },
};

export default function ColourGuideIndex() {
  return (
    <Container className="py-12">
      <div className="mx-auto max-w-2xl">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#B23A25]">Skin-tone colour guide</p>
        <h1 className="text-3xl font-bold tracking-tight text-[#1C1917] sm:text-4xl">Best colours for your skin tone</h1>
        <p className="mt-4 text-base leading-relaxed text-[#4a443d]">
          The right colours near your face make your skin look healthier and brighter in every photo — before you change anything else. Pick your undertone below for the full palette, or let AuraCheck read it from one photo, free and in your browser.
        </p>

        <div className="my-8 rounded-2xl border border-[#E14434]/20 bg-gradient-to-b from-[#E14434]/[0.06] to-transparent p-5 text-center">
          <p className="text-sm font-semibold text-[#1C1917]">Don&apos;t know your undertone?</p>
          <p className="mx-auto mt-1 max-w-sm text-xs text-[#6f675e]">Upload one photo — we read it in seconds, privately, on your device.</p>
          <Link href="/audit/new" className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-[#1C1917] px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5">
            Scan my undertone — free →
          </Link>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {COLOUR_GUIDES.map((g) => (
            <Link
              key={g.slug}
              href={`/colours-for-your-skin-tone/${g.slug}`}
              className="rounded-2xl border border-[#1c1917]/[0.08] bg-[#fbf8f2]/60 p-4 transition-all hover:-translate-y-0.5 hover:border-[#E14434]/30"
            >
              <p className="text-base font-bold text-[#1C1917]">{g.undertone} undertone</p>
              <p className="mt-1 text-xs text-[#6f675e]">Colours for {g.undertoneLower} skin →</p>
            </Link>
          ))}
        </div>
      </div>
    </Container>
  );
}
