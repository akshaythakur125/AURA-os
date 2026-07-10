import type { Metadata } from "next";
import ChallengesPage from "./ClientPage";

export const metadata: Metadata = {
  title: "Aura Challenges — Build Your Streak & Climb the Leaderboard",
  description:
    "Take daily presentation challenges, build your streak, and compete on the leaderboard. Track your progress and earn rewards for consistency.",
  openGraph: {
    title: "Aura Challenges — Streaks, Leaderboard & Rewards",
    description:
      "Daily challenges to upgrade your visual signal. Build streaks, climb the leaderboard, and earn rewards.",
    images: [
      {
        url: "/api/og?category=Aura+Challenges&leak=Build+your+streak+today",
        width: 1200,
        height: 630,
        alt: "Aura Challenges — Streaks & Leaderboard",
      },
    ],
    type: "website",
  },
};

export default function Page() {
  return <ChallengesPage />;
}
