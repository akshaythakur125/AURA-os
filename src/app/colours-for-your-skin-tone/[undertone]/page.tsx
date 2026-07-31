import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { COLOUR_GUIDES, getColourGuide } from "@/lib/seo/colourGuides";
import { searchLink } from "@/lib/shop/searchLink";

type Props = { params: Promise<{ undertone: string }> };

export function generateStaticParams() {
  return COLOUR_GUIDES.map((g) => ({ undertone: g.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { undertone } = await params;
  const g = getColourGuide(undertone);
  if (!g) return { title: "Colours for your skin tone — AuraCheck" };
  return {
    title: g.metaTitle,
    description: g.metaDescription,
    alternates: { canonical: `/colours-for-your-skin-tone/${g.slug}` },
    openGraph: {
      title: g.metaTitle,
      description: g.metaDescription,
      type: "article",
      images: [{ url: `/api/og?category=${encodeURIComponent("Colours for " + g.undertone + " Undertones")}&leak=${encodeURIComponent("Free undertone scan")}`, width: 1200, height: 630, alt: g.metaTitle }],
    },
  };
}

export default async function ColourGuidePage({ params }: Props) {
  const { undertone } = await params;
  const g = getColourGuide(undertone);
  if (!g) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: g.faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Container className="py-12">
        <article className="mx-auto max-w-2xl">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#B23A25]">Skin-tone colour guide</p>
          <h1 className="text-3xl font-bold tracking-tight text-[#1C1917] sm:text-4xl">
            The best colours for a {g.undertoneLower} undertone
          </h1>
          <p className="mt-4 text-base leading-relaxed text-[#4a443d]">{g.intro}</p>

          {/* Primary CTA — scan to confirm undertone */}
          <div className="my-8 rounded-2xl border border-[#E14434]/20 bg-gradient-to-b from-[#E14434]/[0.06] to-transparent p-5 text-center">
            <p className="text-sm font-semibold text-[#1C1917]">Not sure you&apos;re {g.undertoneLower}?</p>
            <p className="mx-auto mt-1 max-w-sm text-xs text-[#6f675e]">Upload one photo and AuraCheck reads your undertone in your browser — free, private, in seconds.</p>
            <Link href="/audit/new" className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-[#1C1917] px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5">
              Scan my undertone — free →
            </Link>
          </div>

          <h2 className="mt-8 text-xl font-bold text-[#1C1917]">How to tell if you have a {g.undertoneLower} undertone</h2>
          <p className="mt-2 text-sm leading-relaxed text-[#4a443d]">{g.howToTell}</p>

          <h2 className="mt-8 text-xl font-bold text-[#1C1917]">Colours that flatter a {g.undertoneLower} undertone</h2>
          <ul className="mt-3 space-y-3">
            {g.bestColours.map((c) => (
              <li key={c.name} className="rounded-xl border border-[#1c1917]/[0.08] bg-[#fbf8f2]/60 p-3.5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-[#1C1917]">✓ {c.name}</p>
                    <p className="mt-0.5 text-sm text-[#4a443d]">{c.why}</p>
                  </div>
                  <a
                    href={searchLink(c.q, "amazon")}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                    className="mt-0.5 shrink-0 rounded-lg border border-[#1c1917]/12 px-2.5 py-1.5 text-[11px] font-semibold text-[#1C1917] transition-colors hover:border-[#E14434]/40"
                  >
                    Shop →
                  </a>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-6 rounded-2xl border border-[#1c1917]/[0.08] bg-[#1c1917]/[0.02] p-4">
            <p className="text-sm font-semibold text-[#1C1917]">💍 Metals that suit you</p>
            <p className="mt-1 text-sm leading-relaxed text-[#4a443d]">{g.metals}</p>
          </div>

          <h2 className="mt-8 text-xl font-bold text-[#1C1917]">Colours to go easy on</h2>
          <ul className="mt-3 space-y-3">
            {g.avoid.map((c) => (
              <li key={c.name} className="rounded-xl border border-[#1c1917]/[0.06] bg-[#1c1917]/[0.02] p-3.5">
                <p className="text-sm font-semibold text-[#4a443d]">✕ {c.name}</p>
                <p className="mt-0.5 text-sm text-[#6f675e]">{c.why}</p>
              </li>
            ))}
          </ul>

          <h2 className="mt-8 text-xl font-bold text-[#1C1917]">Your palette by occasion</h2>
          <div className="mt-3 space-y-2">
            {g.occasions.map((o) => (
              <div key={o.label} className="flex flex-wrap items-baseline justify-between gap-2 rounded-xl border border-[#1c1917]/[0.08] bg-[#fbf8f2]/60 px-3.5 py-2.5">
                <span className="text-sm font-semibold text-[#1C1917]">{o.label}</span>
                <span className="text-sm text-[#4a443d]">{o.colours}</span>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-2xl border border-[#1c1917]/[0.08] bg-[#1c1917]/[0.03] p-5">
            <p className="text-sm font-semibold text-[#1C1917]">💡 Pro tip</p>
            <p className="mt-1 text-sm leading-relaxed text-[#4a443d]">{g.proTip}</p>
          </div>

          <h2 className="mt-8 text-xl font-bold text-[#1C1917]">FAQs</h2>
          <div className="mt-3 space-y-4">
            {g.faqs.map((f) => (
              <div key={f.q}>
                <p className="text-sm font-semibold text-[#1C1917]">{f.q}</p>
                <p className="mt-1 text-sm leading-relaxed text-[#4a443d]">{f.a}</p>
              </div>
            ))}
          </div>

          {/* Cross-links to sibling guides */}
          <div className="mt-10 border-t border-[#1c1917]/10 pt-6">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#857b6e]">Other undertones</p>
            <div className="flex flex-wrap gap-2">
              {COLOUR_GUIDES.filter((o) => o.slug !== g.slug).map((o) => (
                <Link key={o.slug} href={`/colours-for-your-skin-tone/${o.slug}`} className="rounded-full border border-[#1c1917]/10 bg-[#1c1917]/[0.03] px-3 py-1.5 text-xs font-medium text-[#4a443d] hover:border-[#E14434]/40 hover:text-[#1C1917]">
                  Colours for {o.undertoneLower} undertones
                </Link>
              ))}
            </div>
          </div>

          <p className="mt-8 text-center text-[11px] text-[#9c9184]">
            AuraCheck may earn a commission on items bought through these links, at no extra cost to you.
          </p>
        </article>
      </Container>
    </>
  );
}
