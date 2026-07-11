import type { Metadata } from "next";
import NewAuditPage from "./ClientPage";

export const metadata: Metadata = {
  title: "Start Free Aura Check — Upload Photo & Get Your Score",
  description:
    "Upload a photo, answer 3 quick questions, and get your free Aura Score in under 2 minutes. See your biggest photo-quality issue and what to fix first.",
  openGraph: {
    title: "Start Free Aura Check — Get Your Score in 2 Minutes",
    description:
      "Upload a photo, pick your goal, and get a free visual signal analysis. No account required.",
    images: [
      {
        url: "/api/og?category=Free+Aura+Check&leak=Upload+your+photo+now",
        width: 1200,
        height: 630,
        alt: "Start Free Aura Check",
      },
    ],
    type: "website",
  },
};

export default function Page() {
  return <NewAuditPage />;
}
