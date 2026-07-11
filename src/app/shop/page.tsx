import type { Metadata } from "next";
import ShopPage from "./ClientPage";

export const metadata: Metadata = {
  title: "Shop Curated Upgrades — Visual Signal Products",
  description:
    "Browse curated upgrades targeting your specific photo-quality issues — grooming, outfits, lighting, backgrounds. Filter by category, budget, and goal. Prices and links verified.",
  openGraph: {
    title: "AuraCheck Shop — Targeted Upgrades for Your Biggest Leaks",
    description:
      "Curated products that fix the specific things weakening your first impression. Filter by budget and goal.",
    images: [
      {
        url: "/api/og?category=Shop+Curated+Upgrades&leak=Targeted+fixes+for+your+status+leaks",
        width: 1200,
        height: 630,
        alt: "AuraCheck Shop — Curated Upgrades",
      },
    ],
    type: "website",
  },
};

export default function Page() {
  return <ShopPage />;
}
