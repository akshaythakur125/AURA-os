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

export default function HomePage() {
  return (
    <>
      {/* Hero — Apple-style: image + headline + CTA */}
      <Hero3D />

      {/* Feature highlights — clean, minimal, Apple-style product tiles */}
      <section className="bg-black py-20 sm:py-28">
        <Container>
          <FadeInView>
            <div className="grid gap-8 sm:grid-cols-3">
              {[
                {
                  icon: "⚡",
                  title: "60-Second Analysis",
                  desc: "Upload a photo, get scored instantly. No signup, no waiting.",
                },
                {
                  icon: "🎯",
                  title: "Goal-Aware Scoring",
                  desc: "Dating, Instagram, LinkedIn — each goal gets its own scoring engine.",
                },
                {
                  icon: "🛍️",
                  title: "Actionable Fixes",
                  desc: "Not just a score. Personalized tips, product links, and a roadmap.",
                },
              ].map((f) => (
                <div key={f.title} className="text-center">
                  <div className="mb-4 text-3xl">{f.icon}</div>
                  <h3 className="mb-2 text-lg font-semibold text-white">{f.title}</h3>
                  <p className="text-sm text-gray-500">{f.desc}</p>
                </div>
              ))}
            </div>
          </FadeInView>
        </Container>
      </section>

      {/* Final CTA — Apple-style product section */}
      <section className="bg-black py-20 sm:py-28">
        <Container className="text-center">
          <FadeInView>
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Your first impression matters.
            </h2>
            <p className="mx-auto mt-4 max-w-md text-gray-400">
              Find out what your photo is really saying. Free, instant, no signup.
            </p>
            <div className="mt-8">
              <Link href="/audit/new">
                <Button size="lg" className="px-10 py-4 text-base font-semibold">
                  Check Your Aura — Free
                </Button>
              </Link>
            </div>
          </FadeInView>
        </Container>
      </section>
    </>
  );
}
