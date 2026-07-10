import type { Metadata } from "next";
import AuraReportPage from "./ClientPage";

export const metadata: Metadata = {
  title: "Full Aura Report — Detailed Visual Analysis for ₹99",
  description:
    "Unlock the full reason behind your Aura Score. 7-dimension visual breakdown, status leaks ranked by severity, signal mismatch detection, budget upgrade plan, and goal-specific strategy.",
  openGraph: {
    title: "Full Aura Report — ₹99 One-Time Unlock",
    description:
      "Get your full visual breakdown, ranked status leaks, budget upgrade path, and personalized strategy. No subscription.",
    images: [
      {
        url: "/api/og?category=Full+Aura+Report&leak=₹99+one-time+unlock",
        width: 1200,
        height: 630,
        alt: "Full Aura Report — Detailed Visual Analysis",
      },
    ],
    type: "website",
  },
};

export default function Page() {
  return <AuraReportPage />;
}
