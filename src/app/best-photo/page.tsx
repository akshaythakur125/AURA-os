import type { Metadata } from "next";
import BestPhotoClient from "./ClientPage";

export const metadata: Metadata = {
  title: "Best-Photo Picker — Rank Your Photos per Platform",
  description:
    "Upload a few photos and see which one to use for dating, LinkedIn, and Instagram. Each is scored on lighting, clarity, composition, background, and grooming — analyzed privately in your browser.",
  openGraph: {
    title: "Best-Photo Picker — AuraCheck",
    description: "Which of your photos wins for dating vs LinkedIn vs Instagram? Find out in seconds.",
    images: [
      {
        url: "/api/og?category=Best-Photo+Picker&leak=Rank+your+photos+per+platform",
        width: 1200,
        height: 630,
        alt: "Best-Photo Picker — AuraCheck",
      },
    ],
    type: "website",
  },
};

export default function Page() {
  return <BestPhotoClient />;
}
