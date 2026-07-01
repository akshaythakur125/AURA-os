import type { LaunchCheck } from "@/types/launch";

const SEO_ROUTES = [
  "/", "/pricing", "/audit/new", "/wardrobe", "/wardrobe/search",
  "/wardrobe/saved", "/shop", "/deals", "/wardrobe/diagnosis",
  "/privacy", "/terms", "/dashboard",
];

const STYLE_ROUTES = [
  "/style/premium-minimal", "/style/dating-warm", "/style/corporate-sharp",
  "/style/college-casual", "/style/creator-bold",
];

const STORE_ROUTES = [
  "/stores/myntra", "/stores/ajio", "/stores/amazon-fashion",
  "/stores/flipkart-fashion",
];

const GUIDE_ROUTES = [
  "/guides/what-to-wear-for-dating-profile",
  "/guides/college-casual-outfit-guide",
  "/guides/premium-minimal-wardrobe",
];

export function checkSeoHealth(): { checks: LaunchCheck[] } {
  const checks: LaunchCheck[] = [];

  checks.push({
    name: "Core pages",
    status: "manual",
    message: `${SEO_ROUTES.length} core routes configured. Verify each loads in production.`,
  });

  checks.push({
    name: "Style pages",
    status: "manual",
    message: `${STYLE_ROUTES.length} style routes planned. Create content pages before SEO launch.`,
  });

  checks.push({
    name: "Store pages",
    status: "manual",
    message: `${STORE_ROUTES.length} store routes planned. Create before SEO launch.`,
  });

  checks.push({
    name: "Guide pages",
    status: "manual",
    message: `${GUIDE_ROUTES.length} guide routes planned. Create before SEO launch.`,
  });

  checks.push({
    name: "Sitemap",
    status: "manual",
    message: "Create sitemap.xml before production launch",
  });

  checks.push({
    name: "Robots.txt",
    status: "manual",
    message: "Create robots.txt to allow/publicize SEO pages",
  });

  checks.push({
    name: "Meta tags",
    status: "manual",
    message: "Review meta titles and descriptions for key pages",
  });

  return { checks };
}
