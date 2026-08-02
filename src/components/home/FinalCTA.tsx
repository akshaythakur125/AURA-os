"use client";

import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { FadeInView } from "@/components/ui/FadeInView";
import { CampaignLink } from "@/components/marketing/CampaignLink";

export function FinalCTA() {
  return (
    <section className="py-20 sm:py-28 bg-[#0a0a12]">
      <Container className="text-center">
        <FadeInView>
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Ready to see what your photo really says?
          </h2>
          <p className="mx-auto mt-4 max-w-md text-gray-500">
            Free score first. Unlock the complete report for ₹21. No account required for the scan.
          </p>
          <div className="mt-8">
            <CampaignLink href="/audit/new">
              <Button size="lg" className="px-10 py-4 text-base font-semibold">
                Check My Photo
              </Button>
            </CampaignLink>
          </div>
        </FadeInView>
      </Container>
    </section>
  );
}
