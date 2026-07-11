import type { Metadata } from "next";
import { HeroSection } from "@/components/home/HeroSection";
import { HowItWorks } from "@/components/home/HowItWorks";
import { AuditDimensions } from "@/components/home/AuditDimensions";
import { PrivacyMethodology } from "@/components/home/PrivacyMethodology";
import { FinalCTA } from "@/components/home/FinalCTA";

export const metadata: Metadata = {
  title: "AuraCheck — See Your Real First Impression",
  description:
    "Upload a photo, get your free Aura Score. See what your first impression is really saying. Private browser-based analysis, no signup required.",
  openGraph: {
    title: "AuraCheck — See Your Real First Impression",
    description: "Upload a photo, get your free Aura Score. See what your first impression is really saying.",
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


      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "AuraCheck",
          url: "https://fixmyaura.shop",
          description: "Upload a photo, get your free Aura Score. See what your first impression is really saying.",
          applicationCategory: "Photography",
          operatingSystem: "Web",
          offers: {
            "@type": "Offer",
            price: "25",
            priceCurrency: "INR",
            description: "Full Aura Report — detailed visual analysis",
          },
        }) }}
      />

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <HowItWorks />
      <AuditDimensions />
      <PrivacyMethodology />
      <FinalCTA />
    </>
  );
}
