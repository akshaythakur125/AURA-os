import type { Metadata } from "next";
import RetakeCoachClient from "./ClientPage";

export const metadata: Metadata = {
  title: "Retake Coach — Live Camera Guidance",
  description:
    "Real-time coaching for a better photo. Retake Coach reads your framing, lighting, sharpness, and background live and nudges you until the shot is dialed in. Analyzed privately in your browser.",
  openGraph: {
    title: "Retake Coach — AuraCheck",
    description: "Live camera guidance that gets you a better photo before you even take it.",
    images: [
      {
        url: "/api/og?category=Retake+Coach&leak=Live+guidance+for+a+better+shot",
        width: 1200,
        height: 630,
        alt: "Retake Coach — AuraCheck",
      },
    ],
    type: "website",
  },
};

export default function Page() {
  return <RetakeCoachClient />;
}
