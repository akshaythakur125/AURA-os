import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { FadeInView } from "@/components/ui/FadeInView";

export function PostOrNotBand() {
  return (
    <section className="py-10 sm:py-14">
      <Container>
        <FadeInView>
          <div className="relative overflow-hidden rounded-3xl border border-[#E14434]/20 bg-gradient-to-br from-[#E14434]/[0.10] via-[#f59e0b]/[0.05] to-transparent p-7 sm:p-10">
            <div className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-[#E14434]/10 blur-3xl" />
            <div className="relative flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="max-w-xl">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#E14434]/25 bg-[#E14434]/[0.08] px-3 py-1">
                  <span className="text-xs">📸</span>
                  <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[#B23A25]">New · Free · 10 seconds</span>
                </div>
                <h2 className="text-3xl font-bold tracking-tight text-[#1C1917] sm:text-4xl">
                  Post or Not? <span className="text-[#E14434]">Get an instant verdict.</span>
                </h2>
                <p className="mt-3 text-base leading-relaxed text-[#6F675E]">
                  Not sure if that pic is worth posting? Drop it in and get an honest{" "}
                  <span className="font-semibold text-[#4a443d]">POST IT / ALMOST / NOT YET</span> — with the one measured reason and the fix. Then share your card.
                </p>
              </div>
              <div className="shrink-0">
                <Link href="/post-or-not">
                  <Button size="lg" className="px-8 py-4 text-base font-semibold">
                    Try Post or Not →
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </FadeInView>
      </Container>
    </section>
  );
}
