import type { Metadata } from "next";
import DatingPackClient from "./ClientPage";

export const metadata: Metadata = {
  title: "Dating Profile Teardown — Rank, Order & Caption",
  description:
    "Upload your candidate photos and get a ready-to-paste dating profile: each photo scored, put in the winning order with a role, plus bio starters. Analyzed privately in your browser.",
  openGraph: {
    title: "Dating Profile Teardown — AuraCheck",
    description: "Your photos, scored and ordered into a profile that gets swipes — with bio starters.",
    images: [
      {
        url: "/api/og?category=Dating+Profile+Teardown&leak=Your+profile+ordered+to+win",
        width: 1200,
        height: 630,
        alt: "Dating Profile Teardown — AuraCheck",
      },
    ],
    type: "website",
  },
};

export default function Page() {
  return <DatingPackClient />;
}
