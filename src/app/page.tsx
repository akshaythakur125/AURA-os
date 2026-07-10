import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { FadeInView } from "@/components/ui/FadeInView";
import { Hero3D } from "@/components/hero/Hero3D";
import { GlassCard } from "@/components/sections/GlassCard";
import { ImageShowcase } from "@/components/sections/ImageShowcase";

export const metadata: Metadata = {
  title: "AuraCheck — See What Your Presentation Is Really Saying",
  description:
    "Upload a photo, get your free Aura Score, and discover the status leaks weakening your first impression.",
  openGraph: {
    title: "AuraCheck — Know What Your Presentation Is Actually Saying",
    description:
      "Free visual signal analysis. Upload a photo, get your score, and find your biggest status leak in under 2 minutes.",
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

const features = [
  {
    icon: (
      <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
      </svg>
    ),
    title: "Lighting Analysis",
    description: "Detects harsh shadows and flat light that undercut your face.",
  },
  {
    icon: (
      <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M2.25 18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V6A2.25 2.25 0 0 0 19.5 3.75h-15A2.25 2.25 0 0 0 2.25 6v12z" />
      </svg>
    ),
    title: "Background Audit",
    description: "Spots clutter and distractions behind you in every frame.",
  },
  {
    icon: (
      <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
      </svg>
    ),
    title: "Outfit Signal",
    description: "Reads fit, color harmony, and how your clothes read on camera.",
  },
];

const testimonials = [
  {
    quote: "I had no idea my background was sabotaging every photo. One clean wall later and my score jumped 22 points.",
    name: "Maya R.",
    role: "Content Creator",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&q=80",
  },
  {
    quote: "The lighting call was spot-on. I switched from overhead fluorescents to facing a window and the difference is night and day.",
    name: "James K.",
    role: "Startup Founder",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&q=80",
  },
  {
    quote: "Free tool, zero signup, and it caught something my photographer friend missed. My LinkedIn photo finally looks intentional.",
    name: "Priya S.",
    role: "Product Designer",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&q=80",
  },
];

export default function HomePage() {
  return (
    <>
      {/* ─── Aurora Mesh ─── */}
      <div className="aurora-mesh" />
      <div className="aurora-mesh-third" />

      {/* ─── Hero ─── */}
      <Hero3D />

      {/* ─── Before / After Visual Proof ─── */}
      <section className="relative overflow-hidden border-t border-white/[0.04] py-24 sm:py-32 gradient-mesh-bg">
        {/* Decorative floating shapes */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-[10%] top-[20%] h-3 w-3 rounded-full border border-rose-400/20 bg-rose-400/5 animate-[float-dramatic_10s_ease-in-out_infinite]" />
          <div className="absolute right-[15%] bottom-[25%] h-2 w-2 rounded bg-blue-400/15 animate-[float-dramatic_8s_ease-in-out_infinite_1s]" style={{ rotate: "45deg" }} />
        </div>
        <Container>
          <FadeInView>
            <div className="mx-auto mb-14 max-w-2xl text-center">
              <h2 className="gradient-text-animated text-3xl font-bold sm:text-4xl">
                See the difference a signal fix makes.
              </h2>
              <p className="mt-5 text-lg text-gray-400">
                Same person, different signal. Small tweaks, massive impact.
              </p>
            </div>
          </FadeInView>
          <FadeInView delay={100}>
            <ImageShowcase />
          </FadeInView>
        </Container>
      </section>

      {/* ─── Features Grid ─── */}
      <section className="relative overflow-hidden border-t border-white/[0.04] py-24 sm:py-32">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-32 top-10 h-80 w-80 rounded-full bg-blue-500/[0.05] blur-[120px]" />
          <div className="absolute -left-20 bottom-10 h-64 w-64 rounded-full bg-rose-500/[0.05] blur-[100px]" />
        </div>
        <Container>
          <FadeInView>
            <div className="mx-auto mb-14 max-w-2xl text-center">
              <h2 className="gradient-text-animated text-3xl font-bold sm:text-4xl">
                What AuraCheck reveals.
              </h2>
            </div>
          </FadeInView>
          <div className="grid gap-6 sm:grid-cols-3">
            {features.map((f, i) => (
              <FadeInView key={f.title} delay={i * 100}>
                <GlassCard icon={f.icon} title={f.title} description={f.description} />
              </FadeInView>
            ))}
          </div>
        </Container>
      </section>

      {/* ─── Testimonials ─── */}
      <section className="relative overflow-hidden border-t border-white/[0.04] py-24 sm:py-32 gradient-mesh-bg">
        <Container>
          <FadeInView>
            <div className="mx-auto mb-14 max-w-2xl text-center">
              <h2 className="gradient-text-animated text-3xl font-bold sm:text-4xl">
                Real signals, real results.
              </h2>
            </div>
          </FadeInView>
          <div className="grid gap-6 sm:grid-cols-3">
            {testimonials.map((t, i) => (
              <FadeInView key={t.name} delay={i * 100}>
                <div className="glass-card group relative overflow-hidden rounded-2xl p-6 transition-[border-color] duration-300 hover:border-white/[0.1]">
                  <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-rose-500/[0.03] to-blue-500/[0.03] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <div className="relative">
                    <p className="mb-5 text-sm leading-relaxed text-gray-300">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                    <div className="flex items-center gap-3">
                      <img
                        src={t.avatar}
                        alt={t.name}
                        className="h-10 w-10 rounded-full object-cover ring-2 ring-white/10"
                      />
                      <div>
                        <div className="text-sm font-medium text-white">{t.name}</div>
                        <div className="text-xs text-gray-500">{t.role}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </FadeInView>
            ))}
          </div>
        </Container>
      </section>

      {/* ─── Final CTA ─── */}
      <section className="relative overflow-hidden border-t border-white/[0.04] py-24 sm:py-32">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(251,113,133,0.12),transparent_50%)]" />
        <Container className="relative text-center">
          <FadeInView>
            <h2 className="gradient-text-animated text-4xl font-bold sm:text-5xl md:text-6xl">
              Ready to see what you&apos;re really saying?
            </h2>
            <p className="mx-auto mt-5 max-w-lg text-lg text-gray-400">
              Two minutes. No login. Free.
            </p>
            <div className="mt-10">
              <Link href="/audit/new">
                <Button size="lg" className="text-base px-8 py-4">
                  Start Free Aura Check
                </Button>
              </Link>
            </div>
          </FadeInView>
        </Container>
      </section>

      {/* ─── Safety Note ─── */}
      <section className="border-t border-white/[0.04] py-8">
        <Container>
          <p className="text-center text-xs text-gray-600">
            AuraCheck analyzes presentation, not human worth. Scores are guidance, not objective truth.
          </p>
        </Container>
      </section>
    </>
  );
}
