import type { Metadata } from "next";
import StreakPage from "./ClientPage";

export const metadata: Metadata = {
  title: "Your Aura Streak — Track Your Glow-Up | AuraCheck",
  description: "Check a photo each week to build your Aura streak and watch your score climb over time.",
};

export default function Page() {
  return <StreakPage />;
}
