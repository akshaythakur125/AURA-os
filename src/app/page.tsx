import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

const features = [
  {
    title: "Aura Score",
    description:
      "A composite score of your visual presentation across multiple dimensions — expression, style, composition, and signal strength.",
    gradient: "from-purple-600 to-pink-500",
  },
  {
    title: "Status Leak Detector",
    description:
      "Identifies specific elements in your photos and profiles that may weaken your first impression and social signal.",
    gradient: "from-pink-500 to-rose-500",
  },
  {
    title: "Budget Upgrade Plan",
    description:
      "Actionable upgrades ranked by effort and cost — from free tweaks to high-impact investments.",
    gradient: "from-amber-500 to-orange-500",
  },
];

export default function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden py-24 sm:py-32">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(147,51,234,0.15),transparent_50%)]" />
        <Container className="relative text-center">
          <span className="mb-6 inline-flex items-center rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1 text-xs text-purple-300">
            First-Impression Intelligence
          </span>
          <h1 className="bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-4xl font-bold text-transparent sm:text-5xl md:text-6xl">
            Find your biggest status leak.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-400 sm:text-xl">
            AuraCheck analyzes your photo, profile, outfit, and visual
            presentation to show what may be weakening your first impression.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link href="/audit/new">
              <Button size="lg">Start Aura Check</Button>
            </Link>
            <Link href="/pricing">
              <Button variant="outline" size="lg">
                View Pricing
              </Button>
            </Link>
          </div>
        </Container>
      </section>

      <section className="py-20">
        <Container>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <Card key={feature.title} hover>
                <div
                  className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.gradient}`}
                >
                  <div className="h-5 w-5 rounded-full bg-white/30" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-white">
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed text-gray-400">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
