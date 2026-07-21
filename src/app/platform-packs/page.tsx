import type { Metadata } from "next";
import PlatformPacksClient from "./ClientPage";

export const metadata: Metadata = {
  title: "Platform Packs — One Photo, Every Format",
  description:
    "Crop your best photo to the exact sizes each platform wants — dating apps, LinkedIn, Instagram feed, and Stories/Reels — with your face kept in frame. Cropped privately in your browser, ready to download.",
  openGraph: {
    title: "Platform Packs — AuraCheck",
    description: "One photo, cropped perfectly for every platform. Download and post.",
    images: [
      {
        url: "/api/og?category=Platform+Packs&leak=One+photo+every+format",
        width: 1200,
        height: 630,
        alt: "Platform Packs — AuraCheck",
      },
    ],
    type: "website",
  },
};

export default function Page() {
  return <PlatformPacksClient />;
}
