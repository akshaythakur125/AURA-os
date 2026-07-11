import type { Metadata } from "next";
import GlowupPlanPage from "./ClientPage";

export const metadata: Metadata = {
  title: "30-Day Glow-Up Plan — Personalized Upgrade Roadmap for ₹499",
  description:
    "A practical, budget-aware 30-day roadmap for grooming, outfit basics, background, photo system, and profile consistency. Daily missions across 5 categories.",
  openGraph: {
    title: "30-Day Glow-Up Plan One-Time Unlock",
    description:
      "A day-by-day roadmap for your presentation upgrade. Grooming, style, background, photo system, and mindset — budget-aware.",
    images: [
      {
        url: "/api/og?category=30-Day+Glow-Up+Plan&leak=Your+personalized+upgrade+roadmap",
        width: 1200,
        height: 630,
        alt: "30-Day Glow-Up Plan — Personalized Upgrade Roadmap",
      },
    ],
    type: "website",
  },
};

export default function Page() {
  return <GlowupPlanPage />;
}
