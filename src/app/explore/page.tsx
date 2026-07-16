import type { Metadata } from "next";
import ExploreClient from "./ExploreClient";

export const metadata: Metadata = {
  title: "Aura Playground — Play With The 7 Signals",
  description:
    "A playable 3D playground of the 7 aura audit dimensions. Grab, fling and bounce the signal orbs, then tap one to see the fix. Built with WebGL.",
  openGraph: {
    title: "Aura Playground — The 7 Signals, In Your Hands",
    description:
      "Grab, fling and bounce the 7 aura signal orbs, then tap one to see the fix.",
    images: [
      {
        url: "/api/og?category=Aura+Playground&leak=Play+with+the+7+signals",
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
