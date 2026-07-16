import type { Metadata } from "next";
import ExploreClient from "./ExploreClient";

export const metadata: Metadata = {
  title: "Aura Playground — Play With The 11 Status Archetypes",
  description:
    "A playable 3D playground of the 11 status archetypes. Grab, fling and bounce the archetype orbs, then tap one to meet it and its level-up. Built with WebGL.",
  openGraph: {
    title: "Aura Playground — The 11 Archetypes, In Your Hands",
    description:
      "Grab, fling and bounce the 11 status-archetype orbs, then tap one to meet it and its level-up.",
    images: [
      {
        url: "/api/og?category=Aura+Playground&leak=Play+with+the+11+archetypes",
        width: 1200,
        height: 630,
        alt: "AuraCheck — Aura Playground",
      },
    ],
    type: "website",
  },
};

export default function Page() {
  return <ExploreClient />;
}
