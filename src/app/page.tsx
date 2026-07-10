import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { FadeInView } from "@/components/ui/FadeInView";
import { Hero3D } from "@/components/hero/Hero3D";

export const metadata: Metadata = {
  title: "AuraCheck — See Your Real First Impression",
  description:
    "Upload a photo, get your free Aura Score. See what your first impression is really saying.",
  openGraph: {
    title: "AuraCheck — See Your Real First Impression",
    description: "Upload a photo, get your free Aura Score.",
    images: [
      {
        url: "/api/og?category=AuraCheck&leak=Know+what+your+presentation+is+saying",
        width: 1200,
        height: 630,
        alt: "AuraCheck — Free Visual Signal Analysis",
      },
    ],
    type: "website",
  },
};

const premiumFeatures = [
  { icon: "✨", title: "Full Aura Report", desc: "20+ signal analysis points", price: "₹50" },
  { icon: "🎯", title: "Quick Fix Plan", desc: "Your top 3 upgrades ranked", price: "₹25" },
  { icon: "🚀", title: "Glow-Up Roadmap", desc: "30-day visual transformation plan", price: "₹300" },
];

export default function HomePage() {
  return (
    <>
      {/* ─── Aurora Mesh ─── */}
      <div className="aurora-mesh" />
      <div className="aurora-mesh-third" />

      {/* ─── Hero ─── */}
      <Hero3D />

      {/* ─── Free CTA ─── */}
      <section className="relative overflow-hidden py-16 sm:py-20">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(251,113,133,0.08),transparent_60%)]" />
        <Container className="relative text-center">
          <FadeInView>
            <div className="mx-auto max-w-md">
              <p className="mb-4 text-sm font-medium text-rose-400 uppercase tracking-wider">Free · No Signup · 2 Minutes</p>
              <Link href="/audit/new">
                <Button size="lg" className="w-full text-base px-8 py-4">
                  📸 Upload Your Photo
                </Button>
              </Link>
              <p className="mt-3 text-xs text-gray-500">
                Get your free Aura Score instantly
              </p>
            </div>
          </FadeInView>
        </Container>
      </section>

      {/* ─── Premium Flash ─── */}
      <section className="relative overflow-hidden border-t border-white/[0.04] py-20 sm:py-28">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-40 top-0 h-96 w-96 rounded-full bg-rose-500/[0.06] blur-[150px]" />
          <div className="absolute -left-40 bottom-0 h-96 w-96 rounded-full bg-blue-500/[0.06] blur-[150px]" />
        </div>
        <Container className="relative">
          <FadeInView>
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <p className="mb-3 text-xs font-semibold text-blue-400 uppercase tracking-widest">Unlock More</p>
              <h2 className="gradient-text-animated text-3xl font-bold sm:text-4xl md:text-5xl">
                Ready for the full picture?
              </h2>
            </div>
          </FadeInView>
          <div className="mx-auto grid max-w-4xl gap-5 sm:grid-cols-3">
            {premiumFeatures.map((f, i) => (
              <FadeInView key={f.title} delay={i * 120}>
                <div className="glass-card group relative overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:border-white/[0.12] hover:scale-[1.02]">
                  <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-rose-500/[0.04] to-blue-500/[0.04] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <div className="relative">
                    <span className="mb-4 inline-block text-3xl">{f.icon}</span>
                    <h3 className="mb-1 text-lg font-semibold text-white">{f.title}</h3>
                    <p className="mb-4 text-sm text-gray-400">{f.desc}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-rose-400">{f.price}</span>
                      <Link href="/pricing">
                        <Button variant="outline" size="sm">Unlock</Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </FadeInView>
            ))}
          </div>
        </Container>
      </section>

      {/* ─── Safety Note ─── */}
      <section className="border-t border-white/[0.04] py-6">
        <Container>
          <p className="text-center text-xs text-gray-600">
            AuraCheck analyzes presentation, not human worth.
          </p>
        </Container>
      </section>
    </>
  );
}
