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
              <p className="mb-4 text-sm font-medium text-violet-400 uppercase tracking-wider">Free · No Signup · 2 Minutes</p>
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
// trigger redeploy
