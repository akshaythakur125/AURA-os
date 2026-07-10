import type { Metadata } from "next";
import ProgressPage from "./ClientPage";

export const metadata: Metadata = {
  title: "Progress Tracker — Compare Scores Over Time",
  description:
    "Compare your past and current Aura Scores side by side. See which leaks improved, which got worse, and what to focus on next.",
  openGraph: {
    title: "AuraCheck Progress — Compare Your Scores Side by Side",
    description:
    "See your improvement over time. Track which leaks improved and what changed.",
    images: [
      {
        url: "/api/og?category=Progress+Tracker&leak=See+what+improved+over+time",
        width: 1200,
        height: 630,
        alt: "AuraCheck Progress — Compare Scores",
      },
    ],
    type: "website",
  },
};

export default function Page() {
  return <ProgressPage />;
}
