import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api/", "/dashboard", "/unlock", "/audit/", "/progress", "/data"],
      },
    ],
    sitemap: `${process.env.NEXT_PUBLIC_APP_URL || "https://auracheck.app"}/sitemap.xml`,
  };
}
