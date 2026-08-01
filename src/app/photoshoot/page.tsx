import type { Metadata } from "next";
import PhotoshootFlow from "./ClientPage";

export const metadata: Metadata = {
  title: "AI Glow-Up Photoshoot — Studio Portraits From Your Selfies for ₹299",
  description:
    "Upload a few selfies and get a studio-grade AI photoshoot in your matched celebrity's aesthetic — ready-cropped for Instagram, LinkedIn and dating profiles. High-resolution, yours to keep.",
  openGraph: {
    title: "AI Glow-Up Photoshoot",
    description:
      "Turn a few selfies into a studio-grade AI photoshoot in your matched celebrity's look. Instagram, LinkedIn and dating sets — yours to keep.",
    images: [
      {
        url: "/api/og?category=AI+Glow-Up+Photoshoot&leak=Studio+portraits+from+your+selfies",
        width: 1200,
        height: 630,
        alt: "AI Glow-Up Photoshoot",
      },
    ],
    type: "website",
  },
};

export default function Page() {
  return <PhotoshootFlow />;
}
