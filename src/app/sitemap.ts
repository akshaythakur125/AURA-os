import type { MetadataRoute } from "next";
import { GLASSES_GUIDES } from "@/lib/seo/glassesGuides";
import { COLOUR_GUIDES } from "@/lib/seo/colourGuides";
import { HAIRCUT_GUIDES } from "@/lib/seo/haircutGuides";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://fixmyaura.shop";

export default function sitemap(): MetadataRoute.Sitemap {
  const glassesGuides: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/glasses-for-your-face-shape`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    ...GLASSES_GUIDES.map((g) => ({
      url: `${BASE_URL}/glasses-for-your-face-shape/${g.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
  const colourGuides: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/colours-for-your-skin-tone`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    ...COLOUR_GUIDES.map((g) => ({
      url: `${BASE_URL}/colours-for-your-skin-tone/${g.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
  const haircutGuides: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/haircuts-for-your-face-shape`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    ...HAIRCUT_GUIDES.map((g) => ({
      url: `${BASE_URL}/haircuts-for-your-face-shape/${g.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
  return [
    ...glassesGuides,
    ...colourGuides,
    ...haircutGuides,
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${BASE_URL}/pricing`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/shop`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/photo-ranker`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/examples`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/help`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/privacy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/terms`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/products/aura-report`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/products/dating-audit`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/products/glowup-plan`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];
}
