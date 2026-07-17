"use client";

import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { FadeInView } from "@/components/ui/FadeInView";

export function FinalCTA() {
  return (
    <section className="py-20 sm:py-28 bg-[#F2ECE1]">
      <Container className="text-center">
        <FadeInView>
          <h2 className="text-3xl font-bold text-[#1C1917] sm:text-4xl">
            Ready to see what your photo really says?
          </h2>
          <p className="mx-auto mt-4 max-w-md text-[#857b6e]">
            Free, instant, private. No account required.
          </p>
          <div className="mt-8">
            <Link href="/audit/new">
              <Button size="lg" className="px-10 py-4 text-base font-semibold">
                Check My Photo
              </Button>
            </Link>
          </div>
        </FadeInView>
      </Container>
    </section>
  );
}
