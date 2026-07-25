import type { Metadata } from "next";
import GroupCheckPage from "./ClientPage";

export const metadata: Metadata = {
  title: "Group Check — Who Reads Best? | AuraCheck",
  description: "Upload a group photo and see who reads clearest — best-lit, sharpest, most in-frame. Free, private, on your device.",
  openGraph: {
    title: "Group Check — Who Reads Best?",
    description: "Upload a group pic, see who reads clearest. Free and private.",
    images: [{ url: "/api/og?category=Group+Check&leak=Who+reads+best+in+your+group+pic", width: 1200, height: 630, alt: "Group Check — AuraCheck" }],
    type: "website",
  },
};

export default function Page() {
  return <GroupCheckPage />;
}
