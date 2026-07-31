import type { Metadata } from "next";
import PhotoRankerPage from "./ClientPage";

export const metadata: Metadata = {
  title: "AI Dating Photo Ranker — Pick Your Best Profile Photo | AuraCheck",
  description:
    "Upload your photos and an on-device AI ranks them for your dating profile — which to lead with, keep, or cut. Private, runs in your browser, free.",
  alternates: { canonical: "/photo-ranker" },
  openGraph: {
    title: "AI Dating Photo Ranker — Pick Your Best Profile Photo",
    description: "Upload your photos, get an AI ranking of which to lead with. Private, in-browser, free.",
    images: [{ url: "/api/og?category=AI+Photo+Ranker&leak=Pick+your+best+profile+photo", width: 1200, height: 630, alt: "AI Dating Photo Ranker" }],
    type: "website",
  },
};

export default function Page() {
  return <PhotoRankerPage />;
}
