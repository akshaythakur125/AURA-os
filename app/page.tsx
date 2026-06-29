import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden pb-32 pt-24 sm:pt-32">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(147,51,234,0.15),transparent_50%)]" />
        <Container className="relative text-center">
          <span className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1 text-xs text-purple-300">
            <span className="h-1.5 w-1.5 rounded-full bg-purple-400" />
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

      {/* ─── How It Works ─── */}
      <section className="border-t border-white/5 py-20">
        <Container>
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <h2 className="bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-3xl font-bold text-transparent sm:text-4xl">
              How it works
            </h2>
            <p className="mt-4 text-lg text-gray-400">
              Four steps to know where you stand.
            </p>
          </div>
          <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-4">
            {([
              { step: "1", title: "Upload a photo", desc: "Pick an image you use or plan to use publicly." },
              { step: "2", title: "Select your goal", desc: "Casual, professional, dating, or social — the lens changes." },
              { step: "3", title: "Set your budget", desc: "From zero spend to a full upgrade — we match the plan." },
              { step: "4", title: "Get your Aura Score", desc: "See your score, leaks, and a clear path to upgrade." },
            ] as const).map((item) => (
              <div key={item.step} className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-pink-500 text-lg font-bold text-white">
                  {item.step}
                </div>
                <h3 className="mb-2 text-sm font-semibold text-white">{item.title}</h3>
                <p className="text-xs leading-relaxed text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 rounded-xl border border-purple-500/10 bg-purple-500/5 p-4 text-center text-sm text-gray-400">
            The current MVP uses local rule-based logic. No image is sent to any external server.
          </div>
        </Container>
      </section>

      {/* ─── Signal Leaks Preview ─── */}
      <section className="border-t border-white/5 py-20">
        <Container>
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <h2 className="bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-3xl font-bold text-transparent sm:text-4xl">
              Common status leaks
            </h2>
            <p className="mt-4 text-lg text-gray-400">
              Small mismatches between what you own and how you present it.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {([
              { title: "Expensive phone, weak background", desc: "A flagship phone means little if the background screams unmade bed at 3 PM." },
              { title: "Good outfit, poor fit", desc: "Even a premium brand looks off when the fit is baggy or the shoulders don't align." },
              { title: "Good face, bad lighting", desc: "Harsh overhead light can undo good grooming in a single frame." },
              { title: "Premium watch, messy room", desc: "Luxury accessories lose impact when the surroundings suggest chaos." },
              { title: "Nice profile, weak photo order", desc: "Your best photo should be first. Order signals priority." },
              { title: "Trying to look premium, mismatched details", desc: "A blazer with gym shorts. The inconsistency leaks signal." },
            ] as const).map((leak) => (
              <Card key={leak.title} hover>
                <h3 className="mb-2 text-sm font-semibold text-white">{leak.title}</h3>
                <p className="text-sm leading-relaxed text-gray-400">{leak.desc}</p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* ─── Final CTA ─── */}
      <section className="relative overflow-hidden border-t border-white/5 py-24">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(147,51,234,0.12),transparent_50%)]" />
        <Container className="relative text-center">
          <h2 className="bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-3xl font-bold text-transparent sm:text-4xl">
            Ready to check your visual signal?
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-gray-400">
            Two minutes. No login. See what your first impression is really saying.
          </p>
          <div className="mt-8">
            <Link href="/audit/new">
              <Button size="lg">Start Free Aura Check</Button>
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}
