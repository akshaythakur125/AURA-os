import type { Metadata } from "next";
import AuditDetailPage from "./ClientPage";

export const metadata: Metadata = {
  title: "Your Aura Score — AuraCheck Report",
  description:
    "View your Aura Score, top photo-quality issue, and visual signal breakdown. Unlock the full report for detailed analysis, budget upgrade plan, and goal-specific strategy.",
  openGraph: {
    title: "Your Aura Score — AuraCheck Report",
    description:
      "See your score, biggest photo-quality issue, and what to fix first. Unlock the full report for the complete analysis.",
    images: [
      {
        url: "/api/og?category=Your+Aura+Score&leak=See+what+to+fix+first",
        width: 1200,
        height: 630,
        alt: "Your Aura Score — AuraCheck Report",
      },
    ],
    type: "website",
  },
};

export default function Page() {
  return <AuditDetailPage />;
}
