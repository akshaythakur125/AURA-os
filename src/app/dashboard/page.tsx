import type { Metadata } from "next";
import DashboardPage from "./ClientPage";

export const metadata: Metadata = {
  title: "Your Dashboard — Track Scores, Streaks & Progress",
  description:
    "View your Aura Score history, improvement streak, and challenge progress. See your strongest signals and biggest leaks over time.",
  openGraph: {
    title: "AuraCheck Dashboard — Your Progress at a Glance",
    description:
      "Track your score trend, streaks, and improvement over time. See what changed and what to fix next.",
    images: [
      {
        url: "/api/og?category=Your+Dashboard&leak=Track+your+progress+over+time",
        width: 1200,
        height: 630,
        alt: "AuraCheck Dashboard — Track Your Progress",
      },
    ],
    type: "website",
  },
};

export default function Page() {
  return <DashboardPage />;
}
