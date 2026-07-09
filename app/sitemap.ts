import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://auracheck.vercel.app";

  const routes: { path: string; priority: number; changeFrequency: "weekly" | "monthly" | "yearly" }[] = [
    { path: "/", priority: 1.0, changeFrequency: "weekly" },
    { path: "/pricing", priority: 0.9, changeFrequency: "monthly" },
    { path: "/shop", priority: 0.8, changeFrequency: "weekly" },
    { path: "/wardrobe/search", priority: 0.7, changeFrequency: "weekly" },
    { path: "/products/aura-report", priority: 0.8, changeFrequency: "monthly" },
    { path: "/products/dating-audit", priority: 0.8, changeFrequency: "monthly" },
    { path: "/products/glowup-plan", priority: 0.8, changeFrequency: "monthly" },
    { path: "/challenges", priority: 0.7, changeFrequency: "monthly" },
    { path: "/examples", priority: 0.7, changeFrequency: "monthly" },
    { path: "/help", priority: 0.5, changeFrequency: "yearly" },
    { path: "/privacy", priority: 0.5, changeFrequency: "yearly" },
    { path: "/terms", priority: 0.5, changeFrequency: "yearly" },
    { path: "/privacy-center", priority: 0.5, changeFrequency: "yearly" },
    { path: "/install", priority: 0.4, changeFrequency: "yearly" },
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route.path}`,
    lastModified: new Date(),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
